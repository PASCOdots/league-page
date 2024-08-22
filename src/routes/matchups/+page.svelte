<script>
  import { MatchupsAndBrackets } from "$lib/components";

  export let data;
  const {
    queryWeek,
    matchupsData,
    bracketsData,
    playersData,
    leagueTeamManagersData,
  } = data;
</script>

<div id="main">
  <MatchupsAndBrackets
    {queryWeek}
    {matchupsData}
    {bracketsData}
    {playersData}
    {leagueTeamManagersData}
  />
</div>

<style>
  #main {
    position: relative;
    z-index: 1;
  }
</style>
