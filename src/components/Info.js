import React from 'react';
import zones from './zones';

//Info panel component
class Info extends React.Component{
  //Disply correct warning
  checkHealth(){
    let hp = this.props.player.hp / this.props.player.maxHp;
    if(hp < 0.25){
      return "hp-danger";
    }
    else if(hp < 0.5){
      return "hp-warn";
    }
    else{
      return "hp-good";
    }
  }

  render(){
    return (
      <div className={`info info-${this.props.level}`}>
        <h2>{zones[this.props.level-1]} {this.props.level === 5 ? "": "Zone"}</h2>
        <div className={this.checkHealth()}>
          Health: {this.props.player.hp}/{this.props.player.maxHp}
        </div>
        <div>Level: {this.props.player.level}</div>
        <div>Exp: {this.props.player.exp}</div>
        <div>Crystals: {this.props.player.crystals}</div>
        <div>Weapon: {this.props.player.weaponName}</div>
        <div>Armour: {this.props.player.armourName}</div>
        <div className="log">{this.props.log}</div>
        <button onClick={()=>{this.props.light()}}>Toggle Lights</button>
      </div>
    );
  }
}

export default Info;
