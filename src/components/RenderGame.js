import React from 'react';

//Game render function
function RenderGame(props){
  //return how far player can see
  function lightDistance(y1, x1, y2, x2, distance){
    let xDistance = Math.abs(x2 - x1);
    let yDistance = Math.abs(y2 - y1);
    let distanceFromTile = Math.sqrt((xDistance ** 2) + (yDistance ** 2));
    if(distance > distanceFromTile){
      return true;
    }
  }
  return (
    <div className="game">
      {props.dungeon.map((row, i) => {
        return(
          <div key={i} className="row">
            {row.map((tile, j) => {
              if(lightDistance(props.player.y, props.player.x, i, j, 7) || props.light){
                let hp;
                let style;
                if(tile.name){
                  hp = ((tile.health / tile.maxHealth)*30).toString();
                  style = {width: hp+"px"};
                }
                if(tile === 2){
                  hp =((props.player.hp / props.player.maxHp)*30).toString();
                  style = {width: hp+"px"};
                }
                switch(tile){
                  case 0:
                    return <div key={j} className={`tile wall-${props.level}`}></div>
                  case 1:
                    return <div key={j} className={`tile floor-${props.level}`}></div>
                  case 2:
                    return (
                      <div key={j} className={`tile player-${props.level}`}>
                        <div className="hp-bar">
                          <div className="hp-life" style={style}></div>
                        </div>
                      </div>)
                  case 4:
                    return <div key={j} className={`tile chest-${props.level}`}></div>
                  case 5:
                    return <div key={j} className={`tile hp-${props.level}`}></div>
                  case 6:
                    return <div key={j} className={`tile weapon-${props.level}`}></div>
                  case 7:
                    return <div key={j} className={`tile armour-${props.level}`}></div>
                  case 8:
                    return <div key={j} className={`tile crystal-${props.level}`}></div>
                  case 9:
                    return <div key={j} className={`tile door-${props.level}`}></div>
                  case tile.name === "boss":
                    return (<div key={j} className={`tile boss`}>
                             {tile.health < tile.maxHealth ? <div className="hp-bar">
                                <div className="hp-life" style={style}></div>
                              </div> : ""}
                            </div>)
                  default:
                    return (<div key={j} className={`tile enemy-${props.level}`}>
                             {tile.health < tile.maxHealth ? <div className="hp-bar">
                                <div className="hp-life" style={style}></div>
                              </div> : ""}
                            </div>)
                }
              }
              else {
                return <div className="tile" key={j}></div>
              }
            })}
          </div>
        )
      })
      }
    </div>
  );
}

export default RenderGame;
