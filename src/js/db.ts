interface DatabaseEntry {
  id: string
}

export class Database<T extends DatabaseEntry> {
  constructor(public key: string) {}

  save(datum: T) {
    const existingData = this.getAll()
    existingData.push(datum)
    
    localStorage.setItem(this.key, JSON.stringify(existingData))
  }

  get(id: string): T | undefined {
    const all = this.getAll()
    return all.find(item => item.id === id)
  }
  
  getAll(): T[] {
    return JSON.parse(localStorage.getItem(this.key) || '[]')
  }

}
