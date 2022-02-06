export const BowlingStatsConfig = (match_ids: any, runs_given: any, wickets_taken:any):any => {
    return {
        type: 'line',
        data: {
            labels: match_ids,
            datasets: [
              {
                label : 'Wickets taken',
                data: wickets_taken,
                borderColor: 'rgb(0,255,0)',
                backgroundColor: 'rgb(0,255,0)',
                stack: 'combined',
                yAxisID: 'y',
              },
              {
                label : 'Runs given',
                data: runs_given,
                borderColor: 'rgb(0,0,255)',
                backgroundColor: 'rgb(0,0,255)',
                yAxisID: 'y2',
                stack: 'combined',
                type: 'bar'
              }
            ]
          },
        options: {
            scales: {
                y: {
                    stacked : true,
                    title: {
                        display: true,
                        text: 'Wickets',
                        font: {
                            size: 20
                        },
                    },
                    position: 'left',
                    ticks: {
                        color: 'rgb(0,255,0)',
                    }
                },
                y2: {
                    stacked : true,
                    title: {
                        display: true,
                        text: 'Runs',
                        font: {
                            size: 20
                        },
                    },
                    position: 'right',
                    ticks: {
                        color: 'rgb(0,0,255)',
                    }
                }, 
                x: {
                    title: {
                        display: true,
                        text: 'Match ID',
                        font: {
                            size: 20
                        },

                    }
                }
            },
            plugins: {
                legend: {
                    display : true
                }
            }
        }
    }
}
