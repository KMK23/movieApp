import React from "react";
import "./Rating.css"
const RATINGS = [1, 2, 3, 4, 5];

function Star({selectRating, rating, selected, onHover}) {
  const ClassName = `Rating-star ${selected ? "selected" : ""}`


  const handleClick = selectRating ? ()=> selectRating(rating) : undefined
  const handleMouseOver = onHover ? ()=> onHover(rating) : undefined


  return <span onClick={handleClick} className={ClassName} onMouseOver={handleMouseOver} >★</span>;
}
// 반복문을 쓸때(map) 꼭 key 값을 써줘야해. React 는 고유 key값을 써줘서 뭐가 변하는지 알려줘야해
function Rating({selectRating, onHover, hoverRating, onMouseOut}) {
  return (
    <div onMouseOut={onMouseOut}>
      {RATINGS.map((arrNum) => (
        <Star key={arrNum} selectRating={selectRating} rating={arrNum} selected={hoverRating >= arrNum} onHover={onHover} />
      ))}
    </div>
  );
}

export default Rating;
