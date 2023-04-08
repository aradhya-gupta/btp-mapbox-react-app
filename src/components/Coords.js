import React from "react";

export default function Coords({
  clickedPoint,
  showTime,
  title,
  time,
  onTimeChange,
  handleAddStop
}) {
  return (
    <div style={{ margin: "10px" }}>
      <h4 style={{ margin: "2px", textAlign: "center" }}>{title}</h4>
      <label htmlFor="long">Longitude</label>
      <br />
      <input style={{ margin: "2px" }} id="long" value={clickedPoint[0]} readOnly />
      <br />
      <label htmlFor="lat">Latitude</label>
      <br />
      <input style={{ margin: "2px" }} id="lat" value={clickedPoint[1]} readOnly/>
      {showTime && (
        <>
          <br />
          <label htmlFor="time">Time(in min)</label>
          <br />
          <input
            style={{ margin: "2px" }}
            type="number"
            id="time"
            value={time}
            onChange={onTimeChange}
          />
          <br />
          <button style={{marginLeft: "50px"}} onClick={handleAddStop}>Add Stop</button>
        </>
      )}
    </div>
  );
}
