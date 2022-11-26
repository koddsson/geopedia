interface DatabaseEntry {
  id: string
}

type DatabaseEntryId = string

export class Database<T extends DatabaseEntry> {
  constructor(public key: string) {}

  save(datum: T) {
    const existingData = this.getAll()
    existingData.push(datum)
    
    localStorage.setItem(this.key, JSON.stringify(existingData))
  }
  
  remove(id: DatabaseEntryId) {
    const newData = this.getAll().filter(item => item.id !== id)

    localStorage.setItem(this.key, JSON.stringify(newData))
  }

  get(id: DatabaseEntryId): T | undefined {
    const all = this.getAll()
    return all.find(item => item.id === id)
  }
  
  getAll(): T[] {
    return JSON.parse(localStorage.getItem(this.key) || '[]')
  }

}
