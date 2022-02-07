export const RunsChartOptions = (runs:any, team:any) : any =>{
    console.log(runs);
    return {
        type: 'pie',
        data: {
            labels: ["Ones", "Twos", "Threes", "Fours", "Sixes", "Extras"],
            datasets: [{
                label: 'Innings 1',
                data: [parseInt(runs.ones) || 0, parseInt(runs.twos) || 0, parseInt(runs.threes) || 0, parseInt(runs.fours) || 1, parseInt(runs.sixes) || 0, parseInt(runs.extra_runs) || 0],
                backgroundColor: ["red","blue", "orange", "pink", "yellow", "black"],
                borderWidth: 1
            }]
        },
        options:{
          plugins:{
            title: {
              display: true,
              text : team
            }
          }
        }
      }
}