<script lang="ts">
  import { socket } from "../App.svelte";
  import { GameState, ID, getPlayerIndex } from "@store";
  import Cards from "./Cards.svelte";
  const playerIndex = getPlayerIndex($GameState, $ID);

  //Draw +4 or +2 on next player
  $: if ($GameState.players[playerIndex].drewCard) {
    $GameState.players[playerIndex].drewCard = false;

    switch ($GameState.topCard.color) {
      case "Wild":
        console.log("Change Color and Draw 4 Cards");
        multipleDraw(4);
        break;
      default:
        console.log("Draw 2 Cards");
        multipleDraw(2);
        break;
    }
  }

  function nextPlayerTurn(jump: number) {
    let next: number;
    let nextPlayer: number;

    if ($GameState.isClockwise) {
      next = playerIndex + jump;
      nextPlayer =
        next >= $GameState.numOfPlayers ? next - $GameState.numOfPlayers : next;
    }
    //Anticlockwise
    else {
      next = playerIndex - jump;
      nextPlayer = next < 0 ? $GameState.numOfPlayers + next : next;
    }
    return nextPlayer;
  }

  function multipleDraw(drawNb: number) {
    for (let index = 0; index < drawNb; index++) {
      const card = $GameState.drawDeck.shift();
      const last = $GameState.players[playerIndex].cardArray.length;

      $GameState.players[playerIndex].cardArray[last] = card;
    }

    socket.emit("updateState", $GameState);
  }
  function drawCard() {
    //refuse drawCard if not player's turn
    if ($GameState.players[playerIndex].turnToPlay === false) {
      return;
    }

    const Card = $GameState.drawDeck.shift();

    $GameState.players[playerIndex].cardArray[
      $GameState.players[playerIndex].cardArray.length
    ] = Card;

    let nextTurnIndex = nextPlayerTurn(1);

    $GameState.players[playerIndex].uno = false;

    $GameState.currentPlayer = nextTurnIndex;
    $GameState.players[nextTurnIndex].turnToPlay = true;
    $GameState.players[playerIndex].turnToPlay = false;

    socket.emit("updateState", $GameState);
  }

  socket.on("updateState", (state: GameState) => {
    $GameState = state;
    if (state.winner !== null) {
      //todo:show all cards
    }
  });

  //Set top card in discard pile on game launch, exclude special cards
  let endLoop: Boolean = false;
  while (endLoop === false) {
    let card: CardType = $GameState.drawDeck.shift();

    if (
      card.color === "Wild" ||
      card.value === "Draw" ||
      card.value === "Reverse" ||
      card.value === "Skip"
    ) {
      $GameState.drawDeck.push(card);
    } else {
      $GameState.topCard = card;
      $GameState.currentColor = card.color;
      console.log("newState", $GameState);

      endLoop = true;
    }
  }
</script>

<style>
  #playField {
    display: flex;
    justify-content: space-around;
  }

  .drawDeck {
    position: relative;
    padding: 0 10px;
  }

  .Card {
    position: absolute;
  }

  .discardPile {
    padding: 0 10px;
  }
</style>

<div id="playField">
  <div class="drawDeck" on:click={drawCard}>
    <div class="Top Card">
      <Cards faceDown={true} isHighlighted={true} animation="PeekDown" />
    </div>
    <div class="Bottom Card">
      <Cards faceDown={true} isHighlighted={true} animation="PeekDown" />
    </div>
  </div>

  <div class="discardPile">
    <Cards
      value={$GameState.topCard.value}
      color={$GameState.topCard.color}
      isHighlighted={true}
    />
  </div>
</div>
