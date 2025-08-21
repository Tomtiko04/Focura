import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import taskRoutes from './routes/tasks.js'
import userRoutes from './routes/users.js'
import { authMiddleware } from './middleware/auth.js'

const app = express()

const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:8081'
app.use(cors({ origin: clientOrigin, credentials: true }))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/users', userRoutes)

app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Protected content', user: req.user })
})

export default app
