function json_to_rows(objs) {
  let headers = [];
  let body = objs.map(obj => {
    for (let key of Object.keys(obj)) {
      if (!headers.includes(key)) {
        headers.push(key);
      }
    }
    return headers.map(key => obj[key]);
  });
  return [headers, ...body];
}

function rows_to_json(rows) {
  let [headers, ...body] = rows;
  return body.map(row => Object.fromEntries(row.map((val, i) => [headers[i], val])));
}

function ynab(path, options) {
  let { data } = JSON.parse(UrlFetchApp.fetch(
    `https://api.youneedabudget.com/v1/budgets/last-used/${path}`,
    {
      contentType: 'application/json',
      headers: {
        'Authorization': `Bearer ${PropertiesService.getScriptProperties().getProperty('YNAB_API_TOKEN')}`,
      },
      ...options,
    }
  ).getContentText());
  return data;
}
