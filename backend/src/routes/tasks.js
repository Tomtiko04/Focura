import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { Task } from '../models/Task.js'
import { authMiddleware } from '../middleware/auth.js'
import OpenAI from 'openai'
import multer from 'multer'
import fs from 'fs'
import Tesseract from 'tesseract.js'

const router = Router()
const uploadsDir = 'uploads'
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
const upload = multer({ dest: uploadsDir + '/' })

async function parseTasksWithAI (rawText) {
  const apiKey = process.env.OPENAI_API_KEY || 'srrtr4rtjuuu'
  if (!apiKey) {
    // Fallback naive parsing: split by newlines, assume main tasks only
    const lines = String(rawText || '')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
    return lines.map((l) => ({ mainTask: l, subtasks: [], time: null, place: '' }))
  }

  const client = new OpenAI({ apiKey })
  const prompt = `You are a helpful assistant that extracts a user's daily plan from unstructured text.
Return STRICT JSON with the schema:
[{"mainTask": string, "subtasks": string[], "time": string | null, "place": string}]
"time" should be ISO 8601 if possible (assume today with no timezone), else null.
Input:\n${rawText}`

  const resp = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Extract tasks as structured JSON. Do not include any explanation.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0
  })

  const content = resp.choices?.[0]?.message?.content || '[]'
  let data
  try {
    data = JSON.parse(content)
  } catch (e) {
    // Try to extract JSON substring
    const match = content.match(/\[([\s\S]*)\]/)
    data = match ? JSON.parse(match[0]) : []
  }

  if (!Array.isArray(data)) return []

  return data.map((t) => ({
    mainTask: String(t.mainTask || '').trim() || 'Untitled Task',
    subtasks: Array.isArray(t.subtasks) ? t.subtasks.map((s) => String(s)) : [],
    time: t.time ? new Date(t.time) : null,
    place: t.place ? String(t.place) : ''
  }))
}

router.post(
  '/create',
  authMiddleware,
  [body('rawText').isString().withMessage('rawText required')],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { rawText } = req.body
    const parsed = await parseTasksWithAI(rawText)
    if (!parsed.length) return res.status(422).json({ error: 'Could not parse any tasks' })

    const docs = parsed.map((p) => ({ ...p, userId: req.user.id }))
    const created = await Task.insertMany(docs)
    return res.status(201).json({ tasks: created })
  }
)

router.get('/', authMiddleware, async (req, res) => {
  const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 })
  res.json({ tasks })
})

router.post('/ocr', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file?.path) return res.status(400).json({ error: 'No image uploaded' })
    const imagePath = req.file.path
    const result = await Tesseract.recognize(imagePath, 'eng')
    const rawText = result?.data?.text || ''
    fs.unlink(imagePath, () => {})
    if (!rawText.trim()) return res.status(422).json({ error: 'No text recognized' })
    const parsed = await parseTasksWithAI(rawText)
    if (!parsed.length) return res.status(422).json({ error: 'Could not parse any tasks' })
    const docs = parsed.map((p) => ({ ...p, userId: req.user.id }))
    const created = await Task.insertMany(docs)
    return res.status(201).json({ tasks: created, rawText })
  } catch (e) {
    return res.status(500).json({ error: 'OCR processing failed' })
  }
})

export default router
