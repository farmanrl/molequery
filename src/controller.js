
const FORMULA_URL = 'https://api.rsc.org/compounds/v1/filter/formula';
const QUERY_URL = 'https://api.rsc.org/compounds/v1/filter';
const RECORD_URL = 'https://api.rsc.org/compounds/v1/records/batch';

const API_KEY = '7QTkvggUq7puoRAwj9TLPmGwEGVUp61B';

const HEADERS = {
  apikey: API_KEY,
};

// Searches the ChemSpider API for molecules that matches the formula input.
// Response has a queryId, which we use to fetch the result once the request is finished processing.
function searchFormula(formula) {
  return new Promise((resolve, reject) => {
    const requestUrl = FORMULA_URL;
    const body = {
      formula,
      dataSources: [],
      orderBy: 'referenceCount',
      orderDirection: 'descending',
    };
    const options = {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(body),
    };
    fetch(requestUrl, options)
      .then(response => response.json())
      .then((data) => {
        // console.log(data);
        const { queryId } = data;
        resolve(queryId);
      })
      .catch((error) => {
        // console.log(error);
        reject(error);
      });
  });
}

// Searches the ChemSpider API for a queryId that matches the input.
// Response has a list of recordIds that we can use to find the data for our matched molecules.
function searchQuery(queryId) {
  return new Promise((resolve, reject) => {
    const requestUrl = `${QUERY_URL}/${queryId}/results`;
    const options = {
      headers: HEADERS,
    };
    fetch(requestUrl, options)
      .then(response => response.json())
      .then((data) => {
        // console.log(data);
        const recordIds = data.results;
        resolve(recordIds);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
}

// Searches the ChemSpider API for the records matching the ids we query.
// Response has the data for each of the records that are queried.
function searchRecords(recordIds) {
  return new Promise((resolve, reject) => {
    const requestUrl = RECORD_URL;
    const body = {
      recordIds,
      fields: ['Formula', 'CommonName', 'ReferenceCount'],
    };
    const options = {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(body),
    };
    fetch(requestUrl, options)
      // TODO: If the queryId takes too long to process, this throws an error. Need to handle.
      .then(response => response.json())
      .then((data) => {
        console.log(data);
        const { records } = data;
        resolve(records);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// Async promise that handles all the queries and resolves with the records that match the formula.
export default function handleSubmit(formula) {
  return new Promise(async (resolve, reject) => {
    try {
      const queryId  = await searchFormula(formula);
      const recordIds = await searchQuery(queryId);
      const slicedRecordIds = recordIds.slice(0,10);
      const records = await searchRecords(slicedRecordIds);
      resolve(records);
    } catch (error) {
      reject(error);
    }
  });
}