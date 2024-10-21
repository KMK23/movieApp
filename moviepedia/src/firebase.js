import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  // setDoc,
  doc,
  addDoc,
  //여기에 쓰는건 firebase.js 에서 필요한것들..
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  startAfter,
  getDoc,
  // getDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyAUi7Uvi3g2C5INykAnx9Os7y7kqRX7QbM",
  authDomain: "movie-edit-c7ed4.firebaseapp.com",
  projectId: "movie-edit-c7ed4",
  storageBucket: "movie-edit-c7ed4.appspot.com",
  messagingSenderId: "751093375664",
  appId: "1:751093375664:web:fd1b6fdb31fe2ff46b9175",
  measurementId: "G-TXE5QEQFKS",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getDatas(collectionName) {
  const collect = await collection(db, collectionName);
  const snapshot = await getDocs(collect);
  const resultData = snapshot.docs.map((doc) => ({
    docId: doc.id,
    ...doc.data(),
  }));

  return resultData;
}
// 필드, 조건, 부합하는 값을 가져와야 정렬가능 ==> 정렬을 위한 함수야
// options 객체 형태로 넘겨줄꺼임 그 객체에는 order 라는 프로퍼티를 넣어줄꺼야
async function getDatasByOrder(collectionName, options) {
  const collect = await collection(db, collectionName);
  // const q = query(컬렉션정보, 조건1, 조건2, ...)
  const q = query(collect, orderBy(options.order, "desc"));
  const snapshot = await getDocs(q);
  const resultData = snapshot.docs.map((doc) => ({
    docId: doc.id,
    ...doc.data(),
  }));

  return resultData;
}

async function getDatasByOrderLimit(collectionName, options) {
  const collect = await collection(db, collectionName);
  let q;
  if (options.lq) {
    q = query(
      collect,
      orderBy(options.order, "desc"),
      startAfter(options.lq),
      limit(options.limit)
    );
  } else {
    q = query(collect, orderBy(options.order, "desc"), limit(options.limit));
  }
  // const q = query(컬렉션정보, 조건1, 조건2, ..., 조건
  const snapshot = await getDocs(q);
  const lastQuery = snapshot.docs[snapshot.docs.length - 1];
  // console.log(lastQuery);
  const resultData = snapshot.docs.map((doc) => ({
    docId: doc.id,
    ...doc.data(),
  }));

  return { resultData, lastQuery };
}

async function addDatas(collectionName, dataObj) {
  try {
    const uuid = crypto.randomUUID();
    const path = `movie/${uuid}`;
    const url = await uploadImg(path, dataObj.imgUrl);

    dataObj.imgUrl = url;

    //createdAt, upDatedAt ==> 현재날짜를 밀리세컨즈로 바꿔서 넣어주면됌
    const time = new Date().getTime();
    dataObj.createdAt = time;
    dataObj.updatedAt = time;

    //id 필드의 값 ==> 가장 마지막 id + 1
    const lastId = await getLastNum(collectionName, "id");
    dataObj.id = lastId + 1;
    // 문서 ID 자동
    const collect = await collection(db, collectionName);
    const result = await addDoc(collect, dataObj);
    const docSnap = await getDoc(result); //documentReference
    const resultData = { ...docSnap.data(), docId: docSnap.id };

    return resultData;
  } catch (error) {
    return false;
  }
}

async function getLastNum(collectionName, field) {
  const q = query(
    collection(db, collectionName),
    orderBy(field, "desc"),
    limit(1)
  );
  const lastDoc = await getDocs(q);
  const lastNum = lastDoc.docs[0].data()[field];
  return lastNum;
}

async function uploadImg(path, imgFile) {
  // 스토리지 객체 가져오기
  const storage = getStorage();
  // 저장할 이미지 객체 생성
  const imgRef = ref(storage, path);
  // File 객체를 스토리지에 저장
  await uploadBytes(imgRef, imgFile);
  // 저장한 File의 url을 가져오기
  const url = await getDownloadURL(imgRef);
  return url;
}

// async function deleteDatas(collectionName, docId, ...args) {
//args 는 배열로 된다 1,2번은 필수 3번 args 는 있어도 되고 없어도 되고
async function deleteDatas(collectionName, docId, imgUrl) {
  //1. 스토리지 객체 가져온다
  const storage = getStorage();
  try {
    //2. 스토로지에서 이미지 삭제
    const deleteRef = ref(storage, imgUrl);
    await deleteObject(deleteRef);
    //3. 컬렉션에서 문서 삭제
    const docRef = await doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    return false;
  }
  // deleteDoc("삭제할 문서 객체")
}

//이게 결국에 firebase 에 내용을 가져오고 수정하고 저장하고 삭제하고 이런것들을
//하기위해 이쪽에 함수를 만드는거야.
async function updateDatas(collectionName, dataObj, docId) {
  console.log(dataObj.imgUrl);
  const docRef = await doc(db, collectionName, docId);
  // 수정할 데이터 양식 생성 => id, title, content, rating, createdAt, updatedAt, imgUrl 인데 필요없는거 뺴면 title, content , rating, updatedAt, imgUrl 이렇게 5개만 필요하겠네
  const time = new Date().getTime(); // ==> 현재시간 밀리세컨즈로 바꾼다
  dataObj.updatedAt = time;
  //사진 파일이 수정 되면 ==> 기존 사진 삭제 ==> 새로운 사진 추가 ==> url 받아와서 imgUrl 값 셋팅

  if (dataObj.imgUrl !== null) {
    //기존 사진 url 가져오기
    const docSnap = await getDoc(docRef);
    const prevImgUrl = docSnap.data().imgUrl;
    //스토리지에서 기존사진 삭제
    const storage = getStorage();
    const deleteRef = ref(storage, prevImgUrl);
    await deleteObject(deleteRef);
    //새로운 사진 추가
    const uuid = crypto.randomUUID();
    const path = `movie/${uuid}`;
    const url = await uploadImg(path, dataObj.imgUrl);
    dataObj.imgUrl = url;
  } else {
    //imgUrl 프로퍼티 삭제 (사진 안바뀌었을때는 imgUrl 에 null 값이니까 그럼 사진에 엑박뜨니까)
    delete dataObj["imgUrl"];
  }
  //사진 파일 수정 안되면 ==> 변경 데이터만 업데이트
  await updateDoc(docRef, dataObj);
  const updatedData = await getDoc(docRef);
  const resultData = { docId: updatedData.id, ...updatedData.data() };
  return resultData;
}
export {
  db,
  getDatas,
  addDatas,
  deleteDatas,
  updateDatas,
  getDatasByOrder,
  getDatasByOrderLimit,
};
//export 는 말그대로 내보내서 쓰는것들이니까 deleteDats를 쓴거야.
