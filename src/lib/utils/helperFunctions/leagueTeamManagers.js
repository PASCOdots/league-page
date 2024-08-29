import { leagueID, managers } from "$lib/utils/leagueInfo";
import { get } from "svelte/store";
import { teamManagersStore } from "$lib/stores";
import { waitForAll } from "./multiPromise";
import { getManagers, getTeamData } from "./universalFunctions";
import { getLeagueData } from "./leagueData";

export const getLeagueTeamManagers = async () => {
  if (get(teamManagersStore) && get(teamManagersStore).currentSeason) {
    return get(teamManagersStore);
  }
  let currentLeagueID = leagueID;
  let teamManagersMap = {};
  let finalUsers = {};
  let currentSeason = null;
  const pascoUsers = {};
  const awayRosterIDtoUserID = {};

  // loop through all seasons and create a [year][roster_id]: team, managers object
  while (currentLeagueID && currentLeagueID != 0) {
    const awayLeagueID =
      currentLeagueID === import.meta.env.VITE_LEAGUE_ID_PAP
        ? import.meta.env.VITE_LEAGUE_ID_PI
        : import.meta.env.VITE_LEAGUE_ID_PAP;

    const [
      usersRaw,
      leagueData,
      rostersRaw,
      awayRostersRaw,
      pascoUsersRaw,
    ] = await waitForAll(
      fetch(`https://api.sleeper.app/v1/league/${currentLeagueID}/users`, {
        compress: true,
      }),
      getLeagueData(currentLeagueID),
      fetch(`https://api.sleeper.app/v1/league/${currentLeagueID}/rosters`, {
        compress: true,
      }),
      fetch(`https://api.sleeper.app/v1/league/${awayLeagueID}/rosters`, {
        compress: true,
      }),
      fetch(import.meta.env.VITE_BACKEND_URL + "/users")
    ).catch((err) => {
      console.error(err);
    });

    const [users, rosters, awayRostersArr, pascoUsersArr] = await waitForAll(
      // const [users, rosters] = await waitForAll(
      usersRaw.json(),
      rostersRaw.json(),
      awayRostersRaw.json(),
      pascoUsersRaw.json()
    ).catch((err) => {
      console.error(err);
    });

    pascoUsersArr.forEach((i) => {
      pascoUsers[i.id] = i.human_name;
    });

    awayRostersArr.forEach((i) => {
      awayRosterIDtoUserID[i.roster_id] = i.owner_id;
    });

    const year = parseInt(leagueData.season);
    currentLeagueID = leagueData.previous_league_id;
    if (!currentSeason) {
      currentSeason = year;
    }
    teamManagersMap[year] = {};
    const processedUsers = processUsers(users);

    // in order to not overwrite most recent data, only add new entries to finalUsers
    for (const processedUserKey in processedUsers) {
      if (finalUsers[processedUserKey]) continue;
      finalUsers[processedUserKey] = processedUsers[processedUserKey];
    }
    for (const roster of rosters) {
      teamManagersMap[year][roster.roster_id] = {
        team: getTeamData(processedUsers, roster.owner_id),
        managers: getManagers(roster, processedUsers),
      };
    }
  }
  const response = {
    currentSeason,
    teamManagersMap,
    users: finalUsers,
    leagueID,
    pascoUsers,
    awayRosterIDtoUserID,
  };
  teamManagersStore.update(() => response);
  return response;
};

const processUsers = (rawUsers) => {
  let finalUsers = {};
  for (const user of rawUsers) {
    user.user_name = user.user_name ?? user.display_name;
    finalUsers[user.user_id] = user;
    const manager = managers.find((m) => m.managerID === user.user_id);
    if (manager) {
      finalUsers[user.user_id].display_name = manager.name;
    }
  }
  return finalUsers;
};
