function recurrentCategories() {
  let { category_groups } = ynab('categories');
  return category_groups
    .flatMap(grp => grp.categories)
    .map(category => ({
      ...category,
      month_recurrence: (
        category.goal_cadence === 1
        ? category.goal_cadence_frequency :
        category.goal_cadence >= 3 && category.goal_cadence <= 12
        ? category.goal_cadence :
        category.goal_cadence == 13
        ? category.goal_cadence_frequency * 12 :
        category.goal_cadence == 14
        ? 24 :
        undefined
      ),
    }))
    .filter(category => (
      category.month_recurrence
      && category.month_recurrence > 1
    ));
}



function YNAB_PERIODIC_BILL_BALANCES() {
  let months = {};

  return json_to_rows(recurrentCategories().map(category => {
      const nextDueDate = new Date(category.goal_target_month);
      
      const lastRecurrenceDate = new Date(nextDueDate);
      lastRecurrenceDate.setMonth(nextDueDate.getMonth() - category.month_recurrence);

      // Get today's date and calculate months since the last recurrence
      const today = new Date();
      const monthsElapsed = (today.getFullYear() - lastRecurrenceDate.getFullYear()) * 12 + (today.getMonth() - lastRecurrenceDate.getMonth());

      // Calculate ideal balance based on months elapsed since last recurrence
      const goalPerMonth = category.goal_target / category.month_recurrence;
      const idealBalance = goalPerMonth * monthsElapsed
      let balance = category.balance;
      let totalActivity = category.activity;

      if (!category.goal_needs_whole_amount) {
        totalActivity = 0;
        let month = new Date(lastRecurrenceDate.getFullYear(), lastRecurrenceDate.getMonth(), 1);
        let now = new Date();
        while (month <= now) {
          let monthStr = month.toISOString().split("T")[0];
          try {
            months[monthStr] = months[monthStr] || ynab(`/months/${monthStr}`);
            let { month: { categories: monthCategories } } = months[monthStr];
            let monthCategory = monthCategories.find(({id}) => id == category.id);
            totalActivity += monthCategory.activity;
          } catch (e) {
            // noop
          }
          month.setMonth(month.getMonth() + 1);
        }
      }

      balance -= totalActivity;

      return {
        "Category Name": category.name,
        "Frequency": category.month_recurrence,
        "Next Due": category.goal_target_month,
        "Target Type": category.goal_needs_whole_amount ? "Exact" : "Approximate",
        "Target": category.goal_target / 1000,
        "Amount Saved": balance / 1000,
        "Amount Used": totalActivity / 1000,
        "Amount Needed": idealBalance / 1000,
        "Amount Missing": Math.min(0, (balance - idealBalance)) / 1000,
      };
  }));
}