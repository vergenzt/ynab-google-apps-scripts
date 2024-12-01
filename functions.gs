
function YNAB_RECURRING_TXS() {
  let { scheduled_transactions } = ynab('scheduled_transactions');
  scheduled_transactions.forEach(tx => { tx.amount /= 1000.0; });
  return json_to_rows(scheduled_transactions);
}


function YNAB_CATEGORIES() {
  let { category_groups } = ynab('categories');
  return json_to_rows(category_groups.flatMap(grp => grp.categories));
}
