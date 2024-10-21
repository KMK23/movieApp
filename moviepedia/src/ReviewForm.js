import React, { useContext, useState } from "react";
import FileInput from "./FileInput";
import RatingInput from "./RatingInput";
import "./ReviewForm.css";
import { LocaleContext } from "./contexts/LocaleContext";
import useTranslate from "./hooks/useTranslate";

const INITIAL_VALUE = {
  titel: "",
  rating: 0,
  content: "",
  imgUrl: null,
};

function ReviewForm({
  onSubmit,
  handleSubmitSuccess,
  initialValues = INITIAL_VALUE,
  initialPreview,
  handleCancel,
}) {
  const [values, setValues] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslate();
  const handleChange = (name, value) => {
    setValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    handleChange(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //버튼 비활성화
    setIsSubmitting(true);
    const result = await onSubmit("movie", values);
    handleSubmitSuccess(result);

    //버튼 활성화
    setIsSubmitting(false);
    setValues(INITIAL_VALUE);
  };

  return (
    <form className="ReviewForm" onSubmit={handleSubmit}>
      <div>
        <FileInput
          inputName="imgUrl"
          setFile={handleChange}
          value={values.imgUrl}
          initialPreview={initialPreview}
        />
      </div>
      <div className="Form-container">
        <input
          type="text"
          placeholder={t("title placeholder")}
          onChange={handleInputChange}
          name="title"
          value={values.title}
        />
        <RatingInput
          inputName="rating"
          setRating={handleChange}
          value={values.rating}
        />
        <textarea
          placeholder={t("content placeholder")}
          onChange={handleInputChange}
          name="content"
          value={values.content}
        />
        {handleCancel && (
          <button onClick={() => handleCancel(null)}>
            {t("cancel button")}
          </button>
        )}
        {/* 조건부 렌더링을 위해 handleCancel 이 있고, 없고 따지려고, 그 상태에서 && 를써서 확인하는거지
        논리연산을 하는것들에서는 true, false가 다 나와 x==1 이런것만 true false가 나오는게 아니고 
        */}
        <button type="submit" disabled={isSubmitting}>
          {t("confirm button")}
        </button>
      </div>
    </form>
  );
}

export default ReviewForm;
