/*==========================================
             THE CRYSTAL MAZE
        A ROGUELIKE DUNGEON CRAWLER
============================================

TO DO:
  animation?
  mobile?
  !DESKTOP ONLY Tested on Firefox, Chrome, Edge - I may try to add mobile compatability in the future

Dungeon crawler game based on the UK 90's TV game show 'The Crystal Maze'.
Made for the final free code camp data visualisation course.
Made with React and Sass.
Use arrow or WASD keys to move
Best played on full screen.

Most sprites created by David Gervais from http://pousse.rapiere.free.fr/tome/ I created a few myself

Tip - Get the weapon and armour for each level before attacking the enemies.

Spaces Key
  0 = Wall
  1 = Space
  2 = Player
  3 = (Was Enemy however enemies are now objects)
  4 = Chests
  5 = Hp
  6 = Weapon
  7 = Armour
  8 = Crystal
  9 = Stairs

Procedurally generated room system developed from this tutorial https://gamedevelopment.tutsplus.com/tutorials/create-a-procedurally-generated-dungeon-cave-system--gamedev-10099
*/

import React from 'react';
import Info from './Info';
import zones from './zones';
import Modal from './Modal';
import RenderGame from './RenderGame';

//Game Constants
const dungeonWidth = 30;
const dungeonHeight = 18;
const expArray = [0, 50, 100, 200, 400, 600, 900, 1200, 1500, 1800];
const weaponArray = ["Fists", "Axe", "Sword", "Excalibur", "Holy Hand Grenade"];
const armourArray = ["None", "Leather", "Chain Mail", "Plate Mail", "Dragon Scale"];
const enemyNames = ["Snake", "Alien", "Knight", "Mutant", "Dome Dragon"];


//Utility Functions
function randomVal(val){
  return Math.floor(Math.random() * val);
}

//Check if space in dungeon is free or used
function checkFreeSpace(y, x){
  return dungeon[y][x] !== 1;
}

//Dungeon board array
let dungeon = [];
let dungeonRooms = [];

//Create a blank dungeon area
function createDungeon() {
  dungeon = [];
  for(let i=0; i<dungeonHeight; i++){
    let row = [];
    for(let j=0; j<dungeonWidth; j++){
      row.push(0);
    }
    dungeon.push(row);
  }
  return dungeon;
};

//New room constructor
const Room = function(x, y, w, h){
  this.w = w;
  this.h = h;
  this.x = x;
  this.x1 = x;
  this.x2 = x + w;
  this.y = y;
  this.y1 = y;
  this.y2 = y + h;
  //Find center of room
  this.center = {'x': Math.floor((x * 2 + w) / 2),
                 'y': Math.floor((y * 2 + h) / 2)};
};

//Check if newly created room overlaps with other rooms
Room.prototype.overlaps = function(room){
  return (this.x1 <= room.x2 &&
          this.x2 >= room.x1 &&
          this.y1 <= room.y2 &&
          this.y2 >= room.y1);
};

//Adds Vertical corridor into dungeon
function vertCorridor(y1, y2, x) {
  let startPath = Math.min(y1, y2);
  let endPath = Math.max(y1, y2);
  for(let i=startPath; i<endPath+1; i++){
    dungeon[i][x] = 1;
  }
}

//Adds horizontal corridor into dungeon
function hozCorridor(x1, x2, y) {
  let startPath = Math.min(x1, x2);
  let endPath = Math.max(x1, x2);
  for(let i=startPath; i<endPath+1; i++){
    dungeon[y][i] = 1;
  }
}

//Produce randomly sized rooms and attempt to add to dungeon in a free space. Then connect room with previous room
function placeRooms(){
  dungeonRooms = [];
  //Constants for max/min room sizes
  const maxRooms = dungeonWidth * dungeonHeight;
  const minSize = 3;
  const maxSize = 8;
  //Attempt to create and add a new room to the dungeon
  for(let i = 0; i < maxRooms; i++){
    //Give random dimensions within limits to new room
    const w = Math.floor(Math.random() * (maxSize - minSize + 1) + minSize);
    const h = Math.floor(Math.random() * (maxSize - minSize + 1) + minSize);
    const x = Math.floor(Math.random() * (dungeonWidth - w - 1) + 1);
    const y = Math.floor(Math.random() * (dungeonHeight - h - 1) + 1);

    // Create new room
    let room = new Room(x, y, w, h);
    let fail = false;
    //Check if room overlaps other rooms. If it does break out of loop and attempt a new room
    for(let j = 0; j < dungeonRooms.length; j++){
      if(room.overlaps(dungeonRooms[j])){
        fail = true;
        break;
      }
    }
    //If passes, Add room to free space in dungeon
    if(!fail){
      for(let i=room.y1; i<room.y2; i++){
        for(let j=room.x1; j<room.x2; j++){
          dungeon[i][j] = 1;
        }
      }
      //Store center values to allow corridor creation between rooms
      if(dungeonRooms.length !== 0){
        let center = room.center;
        let prevCenter = dungeonRooms[dungeonRooms.length-1].center;
        vertCorridor(prevCenter.y, center.y, center.x);
        hozCorridor(prevCenter.x, center.x, prevCenter.y);
      }
      dungeonRooms.push(room)
    }
  }
}

//Place items into dungeon
function placeItems(num, type){
  for(var i = 0; i < num; i++){
    //Set an initial room to attempt to add item
    let room = dungeonRooms[Math.floor(Math.random() * dungeonRooms.length)];
    let yPos = Math.floor(Math.random() * room.h);
    let xPos = Math.floor(Math.random() * room.w);
    while (checkFreeSpace(room.y1 + yPos, room.x1 + xPos)){
      //Try random room and positions to attempt to add item
      room = dungeonRooms[Math.floor(Math.random() * dungeonRooms.length)];
      yPos = Math.floor(Math.random() * room.h);
      xPos = Math.floor(Math.random() * room.w);
    }
    dungeon[room.y1 + yPos][room.x1 + xPos] = type;
  }
}

//Player and Enemies

//New player constructor
function Player(pos){
  this.x = pos[1];
  this.y = pos[0];
  this.hp = 100;
  this.maxHp = 100;
  this.armour = 1;
  this.armourName = "None";
  this.weapon = 10;
  this.weaponName = "Fists";
  this.crystals = 0;
  this.exp = 0;
  this.level = 0;
  this.name = "Richard";
}

//Place player in random dungeon loaction
function playerStart(){
  const start = dungeonRooms[Math.floor(Math.random()*dungeonRooms.length)];
  dungeon[start.center.y][start.center.x] = 2;
  return [start.center.y, start.center.x];
}

//Enemy constructor
let Enemy = function(name, level){
  this.name = name;
  this.health = (level * 50 + randomVal(50));
  this.maxHealth = this.health;
  this.weapon = ((level * 10) + randomVal(10));
}

//Create final boss
let boss = {
  name: "Dome Dragon",
  health: 1000,
  maxHealth: 1000,
  weapon: 70
};

//Create number of enemies
function createEnemies(num, level){
  let enemiesArray = [];
  for(let i = 1; i <= num; i++){
    let enemy = new Enemy(i, level);
    enemiesArray['enemy'+i] = enemy;
    placeItems(1, enemy);
  }
  return enemiesArray;
}

//Create boss level
const dome = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 5, 1, 1, 1, 1, boss, 1, 1, 1, 1, 5, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 2, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

//Create initial dungeon
function init(chestNum){
  createDungeon();
  placeRooms();
  placeItems(chestNum, 4); //Place Initial Chests
  placeItems(1, 9); //Place initial door
}

init(8);

//Main game component
class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      dungeon: dungeon,
      player: new Player(playerStart()),
      enemies: createEnemies(6, 1),
      level: 1,
      log: "Welcome to the Crystal Maze. Use the arrow keys or WASD to move",
      light: false,
      gotWeapon: false,
      gotArmour: false,
      gameOver: false
    }
    this.move = this.move.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.boss = this.boss.bind(this);
    this.win = this.win.bind(this);
    this.reset = this.reset.bind(this);
    this.light = this.light.bind(this);
  }
  //Handle player move
  move(oldPos, newPos){
    let player = this.state.player;
    let dungeon = this.state.dungeon;
    let tile = dungeon[newPos.y][newPos.x];
    //Check if enemy
    if(typeof tile === 'object'){
      return this.fight(tile, newPos);
    }
    switch(tile){
      case 0:
        return;
      case 4:
        return this.openChest(newPos);
      case 5:
        this.hp();
        break;
      case 6:
        this.weapon();
        break;
      case 7:
        this.armour();
        break;
      case 8:
        this.crystal();
        break;
      case 9:
        return this.nextDungeon();
      default:
        break;
    }
    //Change new position to player and prev to floor
    player.x = newPos.x;
    player.y = newPos.y;
    dungeon[newPos.y][newPos.x] = 2;
    dungeon[oldPos.y][oldPos.x] = 1;
    this.setState({player: player,
                   dungeon: dungeon});
  }
  //Handle combat
  fight(enemy, newPos){
    let player = this.state.player;
    let dungeon = this.state.dungeon;
    let array = this.state.enemies;
    let enemyDamage = Math.floor((player.weapon / 2) + randomVal(player.weapon / 2));
    enemy.health -= enemyDamage;
    let log = `You did ${enemyDamage} damage to ${enemyNames[this.state.level - 1]}\n`;
    let enemyIndex = this.state.enemies['enemy' + enemy.name];
    array[enemyIndex] = enemy;
    if(enemy.health < 1){
      if(enemy.name === "Dome Dragon"){
        return this.win();
      }
      else{
        // let index = array.indexOf(enemyIndex);
        array.splice(enemyIndex, 1);
        dungeon[newPos.y][newPos.x] = 8;
        let exp = randomVal(this.state.level*15) + this.state.level * 15;
        player.exp += exp;
        log = `You defeated ${enemyNames[this.state.level - 1]} and gained ${exp}EXP`;
      }
    }
    else{
      let playerDamage = Math.floor((enemy.weapon / 2) / player.armour + randomVal(enemy.weapon / player.armour));
      player.hp -=  playerDamage;
      log += `You received ${playerDamage} damage\n`;
      if(player.hp < 1){
        return this.gameOver();
      }
    }
    this.checkLevelUp(player);
    this.setState({player: player,
                   dungeon: dungeon,
                   enemies: array,
                   log: log});
  }
  //Handle opening treasure chests
  openChest(newPos){
    let tile;
    let player = this.state.player;
    let weapon = this.state.gotWeapon;
    let armour = this.state.gotArmour;
    let rand = Math.random();
    if(rand < 0.5 && !weapon){
      tile = 6;
      weapon = true;
    }
    else if(rand < 0.8 && !armour){
      tile = 7
      armour = true;
    }
    else{
      tile = 5;
    }
    let exp = randomVal(this.state.level * 10);
    player.exp += exp;
    this.checkLevelUp(player);
    let dungeon = this.state.dungeon;
    dungeon[newPos.y][newPos.x] = tile;
    this.setState({player: player,
                   dungeon: dungeon,
                   log: `You gained ${exp}exp from opening the chest`,
                   gotWeapon: weapon,
                   gotArmour: armour});
  }
  //Handle adding health
  hp(){
    let player = this.state.player;
    player.hp += ((this.state.level * 50) + 50);
    if(player.hp > player.maxHp){
      player.hp = player.maxHp;
    }
    this.setState({player: player,
                   log: `Potion gave you ${(this.state.level * 50) + 50}HP`});
  }
  //handle weapon pickup
  weapon(){
    let player = this.state.player;
    player.weapon += (this.state.level * 5);
    player.weaponName = weaponArray[this.state.level];
    this.setState({player: player,
                   log: `You found the ${weaponArray[this.state.level]}`});
  }
  //handle armour pickup
  armour(){
    let player = this.state.player;
    player.armour += 0.2;
    player.armourName = armourArray[this.state.level];
    this.setState({player: player,
                   log: `You found ${armourArray[this.state.level]} armour`});
  }
  //handle crystal pickup
  crystal(){
    let player = this.state.player;
    player.crystals += 1;
    this.setState({player: player,
                   log: "You found a Crystal!"});
  }
  //handle lava
  lava(){

  }
  //handle entering next dungeon
  nextDungeon(){
    let player = this.state.player;
    if(player.crystals < ((this.state.level * 5 + this.state.level))){
      return this.setState({log: `You need ${this.state.level * 5 + this.state.level} total Crystals to enter the next zone`});
    }
    if(this.state.level === 4){
      return this.boss();
    }
    init(8);
    let start = playerStart();
    player.x = start[1];
    player.y = start[0];
    player.hp = player.maxHp;
    this.setState({
      player: player,
      dungeon: dungeon,
      enemies: createEnemies((this.state.level + 5),this.state.level+1),
      level: (this.state.level+1),
      gotWeapon: false,
      gotArmour: false,
      light: false,
      log: `You entered the ${zones[this.state.level]} Zone!`
    });
  }
  //Check if enough exp to level up
  checkLevelUp(player){
    let oldLevel = player.level;
    for(let i = 0; i < expArray.length; i++){
      if(player.exp < expArray[i]){
        player.level = i;
        if(player.level > oldLevel){
          player.maxHp += Math.floor(randomVal(15) + 15);
        }
        return player;
      }
    }
  }
  //handle final boss level
  boss(){
    let player = this.state.player;
    player.x = 6;
    player.y= 10;
    this.setState({player: player,
                   dungeon: dome,
                   enemies: boss,
                   level: 5,
                   log: `You entered the Crystal Dome.\nDefeat the final boss!`});
  }
  //handle win scenario
  win(){
    window.removeEventListener('keydown', this.handleKeydown);
    this.setState({log: "You Win!",
                   win: true});
  }
  //handle gameover scenario
  gameOver(){
    window.removeEventListener('keydown', this.handleKeydown);
    let player = this.state.player;
    player.hp = 0;
    this.setState({player: player,
                   gameOver: true,
                   log: "You were defeated!"})
  }

  reset(){
    init(9);
    window.addEventListener('keydown', this.handleKeydown);
    this.setState({
      player: new Player(playerStart()),
      dungeon: dungeon,
      enemies: createEnemies(6, 1),
      level: 1,
      gotWeapon: false,
      gotArmour: false,
      log: "Welcome to the Crystal Maze. Use the arrow keys or WASD to move",
      light: false,
      gameOver: false,
      win: false
    });
  }

  light(){
    this.setState({light: !this.state.light});
  }

  handleKeydown(e){
    e.preventDefault();
    let newPos = {};
    let player = this.state.player;
    let oldPos = {x: player.x, y: player.y};
    switch(e.keyCode){
      //Up arrow + w
      case 38:
      case 87:
        newPos = {x: player.x, y: player.y - 1};
        break;
      //Down arrow + s
      case 40:
      case 83:
        newPos = {x: player.x, y: player.y + 1};
        break;
      //Left arrow + a
      case 37:
      case 65:
        newPos = {x: player.x - 1, y: player.y};
        break;
      //Right arrow + d
      case 39:
      case 68:
        // right
        newPos = {x: player.x + 1, y: player.y};
        break;
      default:
        return;
    }
    this.move(oldPos, newPos);
  }

  componentDidMount(){
    window.addEventListener('keydown', this.handleKeydown);
  }

  componentWillUnmount(){
    window.removeEventListener('keydown', this.handleKeydown);
  }

  render(){
    return (
      <div className="container">
        <RenderGame dungeon={this.state.dungeon}
                    player={this.state.player}
                    level={this.state.level}
                    light={this.state.light}
        />
        {this.state.gameOver || this.state.win ?
          <Modal gameOver={this.state.gameOver}
                 reset={this.reset}/>
          : ""}
        <Info player={this.state.player}
              level={this.state.level}
              log={this.state.log}
              light={this.light}
        />
      </div>
    )
  }
}

export default App;
