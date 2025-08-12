import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    mainTask: { type: String, required: true },
    subtasks: { type: [String], default: [] },
    time: { type: Date, default: null },
    place: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
  },
  { timestamps: true }
)

export const Task = mongoose.model('Task', taskSchema)
