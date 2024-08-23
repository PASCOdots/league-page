<script>
  const leagues = [
    {
      id: "1130191724338339840",
      name: "Play-Action PASCO",
    },
    {
      id: "1131280495846907904",
      name: "PASCO Interference",
    },
  ];
</script>

<div class="flex-container">
  {#each leagues as league}
    <div>
      <p>{league.name}</p>
      <div class="flex-container" />
    </div>
  {/each}
</div>

<style>
  .flex-container {
    width: 100%;
    display: flex;
    align-content: center;
    justify-content: space-evenly;
    padding: 10px;
  }
</style>
