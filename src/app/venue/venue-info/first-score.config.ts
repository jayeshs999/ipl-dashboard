export const FirstScoreOptions = (season_year:any[], avg_first_score:any[]) : any =>{
  return {
    type: 'line',
    data: {
        labels: season_year,
        datasets: [{
            label: '',
            data: avg_first_score,
            pointRadius: 0,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    },
    options: {
        scales: {
            y: {
                title: {
                    display: true,
                    text: 'Runs',
                    font: {
                        size: 20
                    },
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Year',
                    font: {
                        size: 20
                    },

                }
            }
        },
        plugins: {
          legend: {
              display : false
          }
      }
    }
}
}