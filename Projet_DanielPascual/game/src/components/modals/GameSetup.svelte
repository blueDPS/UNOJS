<script lang="ts">
  import Button from "../elements/Button.svelte";
  import TextInput from "../elements/TextInput.svelte";
  import Select from "../elements/Select.svelte";
  import { fly } from "svelte/transition";
  import { GameState, username, ID, step } from "@store";
  import { socket } from "../../App.svelte";

  let gameID: string;

  let numOfPlayers: string;

  let options = [
    { id: 1, value: "2", text: "2 Players" },
    { id: 2, value: "3", text: "3 Players" },
    { id: 3, value: "4", text: "4 Players" }
  ];
  console.log(socket.id);

  function createRoom() {
    if (numOfPlayers) {
      $GameState.players[0].username = $username;
      $GameState.numOfPlayers = parseInt(numOfPlayers);

      console.log(socket.id);
      $GameState.roomID = socket.id;
      $GameState.players[0].id = socket.id;
      $ID = socket.id;

      socket.emit("createRoom", $GameState.roomID, numOfPlayers);

      console.log("state:", $GameState);
      $step++;
    }
  }

  function joinRoom() {
    $GameState.roomID = gameID.trim();
    $ID = socket.id;
    console.log($GameState);
    console.log($ID);

    socket.emit("joinRoom", gameID.trim(), $username);
    socket.once("accepted", (status) => {
      if (status) {
        console.log(status);

        $step = 2;
      } else {
        socket.emit("leave", gameID.trim());
        alert("The Room is Full");
      }
    });
    socket.once("noroom", (message) => {
      alert(message);
      console.log($step);

      socket.disconnect();
      socket.connect();
    });
  }
</script>

<style>
  .Container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    height: 100%;
    width: 100%;
    flex-direction: column;
    justify-content: space-around;
  }

  .Line {
    border: 1px solid #326dbf;
  }

  .Second-Container {
    position: relative;
    margin: auto 0 auto 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: max-content;
    padding: 0 75px;
  }

  .form-element {
    width: 300px;
  }
</style>

<div
  class="Container"
  in:fly={{ x: 200, duration: 250 }}
  out:fly={{ x: -100, duration: 250 }}
>
  <div class="Second-Container">
    <div class="form-element">
      <Select label="Number of Players" {options} bind:value={numOfPlayers} />
    </div>
    <Button text="Create" on:click={createRoom} />
  </div>
  <span class="Line" />
  <div class="Second-Container">
    <div class="form-element">
      <TextInput label="Game ID" bind:value={gameID} />
    </div>
    <Button text="Join" on:click={joinRoom} />
  </div>
</div>
