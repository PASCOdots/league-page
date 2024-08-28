<script>
  import { onMount } from "svelte";
  import { waitForAll } from "../../lib/utils/helperFunctions/multiPromise";

  import Textfield from "@smui/textfield";

  export let homeUsers, homeLeagueID;

  console.log(homeUsers);

  // onMount(() => {
  // });

  let homeIdx, awayIdx;
  let leagues = [
    {
      idx: 0,
      id: "989928038173327360",
      name: "Play-Action PASCO",
      users: [],
    },
    {
      idx: 1,
      id: "1131280495846907904",
      name: "PASCO Interference",
      users: [],
    },
  ];

  const updateLeage = (idx, key, data) => {
    const leaguesCopy = [...leagues];
    const leagueCopy = { ...leaguesCopy[idx] };

    leagueCopy[key] = data;
    leaguesCopy[idx] = leagueCopy;
    leagues = leaguesCopy;
  };

  onMount(async () => {
    leagues.forEach((i, idx) => {
      if (i.id === homeLeagueID) {
        homeIdx = idx;
      } else {
        awayIdx = idx;
      }
    });

    const [sleeperUsersRaw, pascoUsersRaw] = await Promise.all([
      fetch(`https://api.sleeper.app/v1/league/${leagues[awayIdx].id}/users`, {
        compress: true,
      }),
      fetch(import.meta.env.VITE_BACKEND_URL + "/users"),
    ]).catch((err) => {
      console.log("usrser err >> ", err);
    });

    let [away, pascoUsers] = await Promise.all([
      sleeperUsersRaw.json(),
      pascoUsersRaw.json(),
    ]);

    const humanNames = {};
    pascoUsers.forEach((i) => {
      humanNames[i.id] = i.human_name;
    });

    if (away.length > 0) {
      away = away.map((i) => {
        const { display_name, user_id, avatar, metadata } = i;
        const { team_name } = metadata;
        return {
          display_name,
          user_id,
          avatar,
          team_name,
          humanName: humanNames[user_id] || "",
        };
      });
      away.sort((a, b) => {
        return a.display_name
          .toLowerCase()
          .localeCompare(b.display_name.toLowerCase());
      });
    }

    let home = [];
    home = Object.keys(homeUsers).map((i) => {
      const { display_name, user_id, avatar, metadata } = homeUsers[i];
      const { team_name } = metadata;
      return {
        display_name,
        user_id,
        avatar,
        team_name,
        humanName: humanNames[user_id] || "",
      };
    });
    home.sort((a, b) => {
      return a.display_name
        .toLowerCase()
        .localeCompare(b.display_name.toLowerCase());
    });

    updateLeage(homeIdx, "users", home);
    updateLeage(awayIdx, "users", away);
  });

  const updateUsersNames = async (e, user_id, leagueIdx) => {
    const humanName = e.target.value;

    await fetch(import.meta.env.VITE_BACKEND_URL + "/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        league: {
          id: leagues[leagueIdx].id,
        },
        id: user_id,
        human_name: humanName,
      }),
    });

    const users = [...leagues[leagueIdx].users];
    const player = users.find((i) => i.user_id === user_id);
    player.humanName = humanName;

    updateLeage(leagueIdx, "users", users);
  };
</script>

<div class="flex-container">
  {#each leagues as league}
    <div>
      <p>{league.name} - {league.id}</p>
      <!-- {#each } -->

      {#each league.users as user}
        <div class="flex-container">
          <img
            class="avatar"
            src={`https://sleepercdn.com/avatars/thumbs/${user.avatar}`}
            alt="home team avatar"
          />
          <Textfield
            label="Display Name"
            value={user.display_name}
            disabled
            style="width:150px;"
          />
          <Textfield
            label="Player Name"
            value={user.humanName}
            on:change={(e) => updateUsersNames(e, user.user_id, league.idx)}
          />
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .flex-container {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    padding: 10px;
  }

  .avatar {
    vertical-align: middle;
    border-radius: 50%;
    height: 35px;
    width: 35px;
    margin: 0;
    margin-right: 10px;
    border: 0.25px solid #777;
    background-color: #eee;
  }
</style>
