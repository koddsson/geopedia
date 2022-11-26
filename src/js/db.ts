interface DatabaseEntry {
  id: string
}

export class Database<T extends DatabaseEntry> {
  constructor(public key: string) {}

  save(datum: T) {
    const existingData = this.get<T>()
    existingData.push(datum)
    
    localStorage.setItem(this.key, JSON.stringify(existingData))
  }
  
  get<T>(): T[] {
    return JSON.parse(localStorage.getItem(this.key) || '[]')
  }
}
