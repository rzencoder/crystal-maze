import React from 'react';

//Modal compoent
function Modal(props){
  return (
    <div className={`modal ${props.gameOver ? "defeated" : ""}`}>
      <h3>{props.gameOver ? "You were Defeated!" : "You Cracked the Crystal Maze!"}</h3>
      <button onClick={()=>{props.reset()}}>Play Again</button>
    </div>
  );
}

export default Modal;
