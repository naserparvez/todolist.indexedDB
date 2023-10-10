"use strict";
import { uid } from "./uid.js";
console.log(uid());

//selecting element
let inputBox = document.querySelector("#inputbox");
let button = document.querySelector("button");
let listUl = document.querySelector(".list-container");
let db = null;

//create database
let IDB = (function init() {
  let objectStore = null;
  let DBOpenReq = indexedDB.open("myDB", 15);

  DBOpenReq.addEventListener("error", (err) => {
    //Error occurred while trying to open DB
    console.warn(err);
  });

  // DBOpenReq.addEventListener("success", (ev) => {
  //   //DB has been opened... after upgradeneeded
  //   db = ev.target.result;
  //   console.log("success", db);

  // });
  DBOpenReq.onsuccess = () => {
    db = DBOpenReq.result;
    console.log("success", db);
    showList();
  };

  DBOpenReq.addEventListener("upgradeneeded", (ev) => {
    //first time opening this DB
    //OR a new version was passed into open()
    db = ev.target.result;
    console.log("DB updated successfully");

    //crate objectstore
    if (!db.objectStoreNames.contains("todolist")) {
      objectStore = db.createObjectStore("todolist", { keyPath: "id" });
    }

    // db.createObjectStore("test");
    if (db.objectStoreNames.contains("test")) {
      db.deleteObjectStore("test");
    }
  });
})();

////Adding Data
button.addEventListener("click", (ev) => {
  ev.preventDefault();
  if (inputBox.value === "") {
    alert("You must Write Something");
  } else {
    let listItem = document.createElement("li");
    listItem.innerHTML = inputBox.value;
    listUl.appendChild(listItem);
    let span = document.createElement("span");
    span.innerHTML = "&#10060;";
    listItem.appendChild(span);

    //working with indexedDB
    let list = {
      id: uid(),
      item: inputBox.value,
    };

    let tx = db.transaction("todolist", "readwrite");
    tx.oncomplete = (ev) => {
      // console.log(ev);
      //show data
      showList();
    };
    tx.onerror = (err) => {
      console.warn(err);
    };

    let store = tx.objectStore("todolist");
    let request = store.add(list);

    request.onsuccess = () => {
      console.log("Object Added successfully");
    };
    request.onerror = (err) => {
      console.log("Error in request ", err);
    };

    //clear inputBox
    inputBox.value = "";
  }
});

////show data
let showList = () => {
  let tx = db.transaction("todolist", "readonly");
  tx.oncomplete = (ev) => {
    // console.log(ev);
  };
  tx.onerror = (err) => {
    console.warn(err);
  };

  let store = tx.objectStore("todolist");
  var getReq = store.getAll();

  getReq.onsuccess = (ev) => {
    let request = ev.target;
    // console.log({ request });
    listUl.innerHTML = request.result
      .map((list) => {
        return `<li data-key="${list.id}">${list.item}<span>&#10060;</span> </li>`;
      })
      .join("\n");
  };
  getReq.onerror = (err) => {
    console.log("Error in request ", err);
  };
};

//operation for cheekd and delet
listUl.addEventListener("click", (event) => {
  if (event.target.tagName === "LI") {
    event.target.classList.toggle("checked");
  } else if (event.target.tagName === "SPAN") {
    // event.target.parentElement.remove();
    deleteItem(event);
  }
});

////delet item
function deleteItem() {
  let listItems = document.querySelector("li");
  let key = listItems.getAttribute("data-key");
  if (key) {
    let tx = db.transaction("todolist", "readwrite");
    tx.oncomplete = (ev) => {
      // console.log(ev);
      showList();
    };

    let store = tx.objectStore("todolist");
    let request = store.delete(key); //request a delete

    request.onsuccess = (ev) => {
      console.log("successfully deleted an object");
      //move on to the next request in the transaction or
      //commit the transaction
    };
    request.onerror = (err) => {
      console.log("error in request to delete");
    };
  }
}
