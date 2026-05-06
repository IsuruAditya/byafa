import { MongoMemoryReplSet } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { beforeAll, afterAll, afterEach } from 'vitest'

let replSet: MongoMemoryReplSet

beforeAll(async () => {
  // Use a replica set so MongoDB transactions work in tests
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } })
  const uri = replSet.getUri()
  await mongoose.connect(uri)
}, 60000) // replica set init can take a moment

afterEach(async () => {
  // Clear all collections between tests for isolation
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key]!.deleteMany({})
  }
})

afterAll(async () => {
  await mongoose.disconnect()
  await replSet.stop()
})
