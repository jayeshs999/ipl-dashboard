export const MatchOutlineOptions = (info:any) : any =>{
    console.log(info);
    return {
        type: 'pie',
        data: {
            labels: ["Team Batting 1st Won", "Team Batting 2nd Won", "Draw"],
            datasets: [{
                label: 'Innings 1',
                data: [info.won_first, info.won_second,info.draw],
                backgroundColor: ["blue","red", "orange"],
                borderWidth: 1
            }]
        }
      }
}