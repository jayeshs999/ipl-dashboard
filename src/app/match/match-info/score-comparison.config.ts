
export const ScoreComparisonOptions = (num_balls:any, runs:any, wickets:any, teams:any) => {
    return {
        type: 'line',
        data: {
            labels: Array.from(Array(num_balls[0] > num_balls[1] ? num_balls[0] : num_balls[1]).keys()),
            datasets: [{
                label: teams[0],
                data: runs[0].map((e:any,i:any)=>{
                    return {x:i,y:e}
                }),
                pointRadius: 0,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            },
            {
                label: teams[1],
                data: runs[1].map((e:any,i:any)=>{
                    return {x:i,y:e}
                }),
                pointRadius: 0,
                borderColor: 'rgb(175, 46, 92)',
                tension: 0.1
            },
            {
                data: wickets[1].map((e:any)=>{
                    return {x : e, y : runs[1][e],r :6}
                }),
                label: 'wicket',
                // steppedLine: true,
                backgroundColor: 'rgb(175, 46, 92)',
                type: 'bubble'
            },
            {
                data:  wickets[0].map((e:any)=>{
                    return {x : e, y : runs[0][e],r :6}
                }),
                label: 'wicket',
                // steppedLine: true,
                backgroundColor: 'rgb(75, 192, 192)',
                type: 'bubble'
            },
            ]
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
                        text: 'Overs',
                        font: {
                            size: 20
                        },

                    },
                    ticks: {
                        callback: (val: any, index: any) => {
                            // Hide every 2nd tick label
                            return index % 6 == 0 ? (index / 6).toString() : '';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        filter: (item: any, data: any) => {
                            return item.text != 'wicket';
                        }
                    }
                }
            }
        }
    }
}
