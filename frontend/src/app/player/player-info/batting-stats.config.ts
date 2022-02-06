export const COLORS = [
    'rgb(255, 99, 132)',
    'rgb(255, 159, 64)',
    'rgb(255, 205, 86)',
    'rgb(75, 192, 192)',
]
export const LEGEND_NAMES = ['< 20', '<=30', '<=50', '>50']

export const BattingsStatsConfig = (match_ids: any, runs: any):any => {
    return {
        type: 'bar',
        data: {
            labels: match_ids,
            datasets: [{
                data: runs,
                backgroundColor: runs.map((ele:any)=>{
                    if(ele < 20)
                        return COLORS[0];
                    else if(ele < 31)
                        return COLORS[1];
                    else if(ele < 51)
                        return COLORS[2];
                    else
                        return COLORS[3];
                }),
            }]
        },
        options: {
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Runs scored',
                        font: {
                            size: 20
                        },
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
                    display : false
                }
            }
        }
    }
}
