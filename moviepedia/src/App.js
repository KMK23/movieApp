import { useEffect, useState } from "react";
import "./App.css";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";
import logoImg from "./assets/logo.png";
// import mockItems from "./mock.json";
import {
  addDatas,
  deleteDatas,
  getDatas,
  getDatasByOrder,
  getDatasByOrderLimit,
  updateDatas,
} from "./firebase";
import LocaleSelect from "./LocaleSelect";
import useTranslate from "./hooks/useTranslate";

const LIMIT = 10;

function AppSortButton({ children, onClick, selected }) {
  let isSelected = "";
  if (selected) {
    isSelected = "selected";
  }
  return (
    <button className={`AppSortButton ${isSelected}`} onClick={onClick}>
      {children}
    </button>
  );
}
// children 은 텍스트 뿐만 아니라 요소, 다른 컴포넌트도 가능
//ex) AppSortButton 사이에 Review 컴포넌트를 넣어도 되는거야
function App() {
  const [items, setItems] = useState([]);
  const [order, setOrder] = useState("createdAt");
  const [lq, setLq] = useState();
  const [hasNext, setHasNext] = useState(true);
  const t = useTranslate();
  const handleLoad = async (options) => {
    const { resultData, lastQuery } = await getDatasByOrderLimit(
      "movie",
      options
    );
    // console.log(resultData);
    if (!options.lq) {
      setItems(resultData);
    } else {
      setItems((prevItems) => [...prevItems, ...resultData]);
    }
    if (!lastQuery) {
      setHasNext(false);
    }
    setLq(lastQuery);
  };
  // 두번째 훅 useEffect [] 안에 아무것도 없다면!!!
  // 화면이 최초 랜더링 될때 한번만 실행된다.
  // 배열안에 state를 써주고 걔가 변경되면 한번 더 실행한다
  // 배열안에 items 를 넣었더니 한번 랜더링 되고 위에 App 또 읽다가
  // setItems를 만나니까 그게 items 에 들어가고
  // 그러고 나서 배열에 있는 items 를 만나니까 계속 바뀌는줄 안다

  const handleNewestClick = () => setOrder("createdAt");
  const handleBestClick = () => setOrder("rating");

  const handleMoreClick = () => {
    handleLoad({ order: order, limit: LIMIT, lq: lq });
    console.log(lq);
  };

  const handleDelete = async (docId, imgUrl) => {
    //1. 파이어베이스에 접근해서 imgUrl 을 사용해 스토리지에 있는 사진파일 삭제

    //2. docId를 사용해 문서 삭제
    const result = await deleteDatas("movie", docId, imgUrl);
    //db에서 삭제를 성공했을때만 결과를 화면에 반영한다.
    if (!result) {
      alert("저장된 이미지 파일이 없습니다. \n관리자에게 문의하세요.");
      return false;
    }
    //3. items 에서 docId가 같은 요소(객체)를 찾아서 제거 해야
    //  setItems((prevItem) => {
    //     const filteredArr = prevItem.filter((item) => {
    //       return item.docId !== docId;
    //     });
    //     return filteredArr;
    //   });
    setItems((prevItems) => prevItems.filter((item) => item.docId !== docId));
  };

  const handleAddSuccess = (data) => {
    setItems((prevItems) => [data, ...prevItems]);
  };

  const handleUpdateSuccess = (result) => {
    //화면처리... 기존데이터는 items 에서 삭제, 수정된 데이터는 items의 기존 위치에 추가
    setItems((prevItems) => {
      const splitIdx = prevItems.findIndex((item) => item.id === result.id);
      return [
        ...prevItems.slice(0, splitIdx),
        result,
        ...prevItems.slice(splitIdx + 1),
      ];
    });
  };

  useEffect(() => {
    handleLoad({ order: order, limit: LIMIT });
    setHasNext(true);
  }, [order]);

  // console.log(handleBestClick);
  return (
    <div className="App">
      <nav className="App-nav">
        <div className="App-nav-container">
          <img className="App-logo" src={logoImg} alt="사진" />
          <LocaleSelect />
        </div>
      </nav>
      <div className="App-container">
        <div className="App-ReviewForm">
          <ReviewForm
            onSubmit={addDatas}
            handleSubmitSuccess={handleAddSuccess}
          />
        </div>
        <div className="App-sorts">
          <AppSortButton
            selected={order === "createdAt"}
            onClick={handleNewestClick}
          >
            {t("newest")}
          </AppSortButton>
          <AppSortButton
            selected={order === "rating"}
            onClick={handleBestClick}
          >
            {t("best")}
          </AppSortButton>
        </div>
        <div className="App-ReviewList">
          <ReviewList
            items={items}
            handleDelete={handleDelete}
            onUpdate={updateDatas}
            onUpdateSuccess={handleUpdateSuccess}
          />
          {/* {hasNext && (
            <button className="App-load-more-button" onClick={handleMoreClick}>
              더 눌러봐유
            </button>
          )} */}
          <button
            className="App-load-more-button"
            onClick={handleMoreClick}
            disabled={!hasNext}
          >
            {t("load more ")}
          </button>
        </div>
      </div>
      <footer className="App-footer">
        <div className="App-footer-container">|{t("privary policy")}</div>
      </footer>
    </div>
  );
}

export default App;
