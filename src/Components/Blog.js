import { useRef, useState, useEffect, useReducer } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, doc, setDoc, getDocs,onSnapshot, deleteDoc } from "firebase/firestore";

function blogsReducer(state, action) {
  switch (action.type) {
    case "Add":
      return [action.blog, ...state];

    case "Remove":
      return state.filter((blog, index) => index != action.index);
    default:
      return [];
  }
}

//Blogging App using Hooks
export default function Blog() {
  // const [title,setTitle] = useState("");
  // const [desc,setDesc] = useState("");
  const [formData, setFormData] = useState({ title: "", desc: "" });
    const [blogs, setBlogs] = useState([]);
  // const [blogs, dispatch] = useReducer(blogsReducer, []);
  const titleRef = useRef(null);
  useEffect(() => {
    titleRef.current.focus();
  }, []);
  useEffect(() => {
    if (blogs.length && blogs[0].title) {
      document.title = blogs[0].title;
    } else {
      document.title = "No Blogs";
    }
  }, [blogs]);

  useEffect(() => {

    //with this function we r getting the data but we were not getting in
    //real time so below code is real time data using onsnapshot
    // async function fetchData() {
    //   const querySnapshot = await getDocs(collection(db, "blogs"));
    //   // querySnapshot.forEach((doc) => {
    //   //   // doc.data() is never undefined for query doc snapshots
    //   //   console.log(doc.id, " => ", doc.data());
    //   // });
    //   const blogs = querySnapshot.docs.map((doc)=>{
    //     return{
    //       id: doc.id,
    //       ...doc.data()
    //     }
    //   })
    //   setBlogs(blogs);
    // }
    // fetchData();

    const unsub = onSnapshot(collection(db,"blogs"),(snapShot)=>{
      const blogs = snapShot.docs.map((doc)=>{
            return{
              id: doc.id,
              ...doc.data()
            }
          })
          console.log(blogs);
          setBlogs(blogs);
    })
  }, []);

  //Passing the synthetic event as argument to stop refreshing the page on submit
  async function handleSubmit(e) {
    e.preventDefault();

    setBlogs([{ title: formData.title, desc: formData.desc }, ...blogs]);
    //ye to comment ho jayea na jb mai firebase se launga 
    //acha to change kya kru?

    // dispatch({
    //   type: "Add",
    //   blog: { title: formData.title, desc: formData.desc },
    // });

    // Add a new document with a generated id.
    const docRef = doc(collection(db, "blogs"));
    await setDoc(docRef, {
      title: formData.title,
      content: formData.desc,
      createdOn: new Date(),
    });

    setFormData({ title: "", desc: "" });
    titleRef.current.focus();
  }
  async function removeBlog(id) {
    // setBlogs(blogs.filter((blog, index) => i !== index));
    // dispatch({ type: "Remove", index: i });
    const docRef = doc(db,"blogs",id);
    await deleteDoc(docRef);
  }
  return (
    <>
      {/* Heading of the page */}
      <h1>Write a Blog!</h1>

      {/* Division created to provide styling of section to the form */}
      <div className="section">
        {/* Form for to write the blog */}
        <form onSubmit={handleSubmit} className="form">
          {/* Row component to create a row for first input field */}
          <Row label="Title">
            <input
              className="input"
              placeholder="Enter the Title of the Blog here.."
              value={formData.title}
              ref={titleRef}
              onChange={(e) =>
                setFormData({ title: e.target.value, desc: formData.desc })
              }
            />
          </Row>

          {/* Row component to create a row for Text area field */}
          <Row label="Content">
            <textarea
              className="input content"
              placeholder="Content of the Blog goes here.."
              value={formData.desc}
              required
              onChange={(e) =>
                setFormData({ title: formData.title, desc: e.target.value })
              }
            />
          </Row>

          {/* Button to submit the blog */}
          <button
            className="btn"
            onSubmit={(e) => {
              handleSubmit(e);
            }}
          >
            ADD
          </button>
        </form>
      </div>

      <hr />

      {/* Section where submitted blogs will be displayed */}
      <h2> Blogs </h2>
      {blogs.map((blog, i) => (
        <div className="blog" key={i}>
          <h3>{blog.title}</h3>
          <p>{blog.content}</p>
          <div className="blog-btn">
            <button className="btn remove" onClick={() => removeBlog(blog.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </>
  );
}

//Row component to introduce a new row section in the form
function Row(props) {
  const { label } = props;
  return (
    <>
      <label>
        {label}
        <br />
      </label>
      {props.children}
      <hr />
    </>
  );
}
