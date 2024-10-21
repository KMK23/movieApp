import React, { useEffect, useRef, useState } from "react";
import placeholderImg from "./assets/preview-placeholder.png";
import "./FileInput.css";
import resetImg from "./assets/ic-reset.png";

function FileInput({ setFile, inputName, value, initialPreview }) {
  const [preview, setPreview] = useState(initialPreview);
  //스크립트에서 id, class 에 접근할때 query, getElbyId 등 쓰는것처럼 쓰는 훅이야
  const inputRef = useRef();

  const handleFileChange = (e) => {
    const nextFile = e.target.files[0];
    setFile(inputName, nextFile);
  };

  const handleClearClick = () => {
    const inputNode = inputRef;
    console.log(inputNode);
    // inputNode.current.value = "";
    setFile(inputName, null);
  };

  useEffect(() => {
    //value값이 없을 수도 있기 때문에 useEffect 를 종료 해준다.
    if (!value) return;

    //ObjectURL 객체를 사용하여 미리보기 기능을 구현 할 수 있다.
    //ObjectURL 을 만들면 웹 브라우저에 메모리를 할당한다.
    //할당 한 후에는 해제를 해줘야한다. ==> 메모리 낭비 방지 위해
    //해제를 하는 시점은 useEffect 에서 제공하는 사이드 이펙트를 정리하는 시점에 한다.
    //useEffect 에서 return 을 해줄때 정리하는 함수를 리턴해주면 사이드 이펙트를 제거할수 있다.

    const nextPreview = URL.createObjectURL(value);
    setPreview(nextPreview);

    //디펜던시 리스트에 있는 값이 바뀌면 다시 함수를 실행하는데, 이전에 리액트는
    //앞에서 리턴한 정리 함수(clean-up 함수)를 실행해서 사이드 이펙트를 정리한다
    //재렌더링 => useEffect 함수실행 => 그 안에 있는 return 함수 기억 =>
    //사용자 파일이 변경 되면 value 값 변경으로 인한 useEffect 함수 실행=>
    //앞에서 기억해 뒀던 return 함수 실행

    return () => {
      setPreview();
      URL.revokeObjectURL(nextPreview);
    };
  }, [value]);

  // ReivewForm 렌더링 => FileInput 렌더링 되면서 useEffect 실행 =>
  // useEffect 내부 코드 실행 사진 변경 => ReviewForm 재 렌더링 =>FileInput도 재 렌더링 이때에는 useEffect 내부 코드가 실행되는게 아니다.
  //useEffect 실행 시점
  //1.최초 렌더링시
  //2.디펜던시 리스트에 들어있는 값이 변경될때
  //3.컴포넌트가 unmount 될 때

  return (
    <div className="FileInput">
      <img
        src={preview || placeholderImg}
        alt="사진"
        className={`FileInput-preview ${preview ? "selected" : ""}`}
      />
      <input
        type="file"
        accept="image/*"
        className="FileInput-hidden-overlay"
        onChange={handleFileChange}
        ref={inputRef}
      />
      {value && (
        <button className="FileInput-clear-button" onClick={handleClearClick}>
          <img src={resetImg} alt="" />
        </button>
      )}
    </div>
  );
}

export default FileInput;
