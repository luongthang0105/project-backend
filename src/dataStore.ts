// YOU SHOULD MODIFY THIS OBJECT BELOW
import fs from 'fs'
import { dataStore } from './types'

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData(): dataStore {
  return JSON.parse(String(fs.readFileSync('./dataStore.json')))
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: dataStore) {
  fs.writeFileSync('./dataStore.json', JSON.stringify(newData))
}

export { getData, setData }
