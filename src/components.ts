import { selectDomElement } from "./utils";
import js from "./assets/fileIcons/js/js1.svg";
import ts from "./assets/fileIcons/js/ts.svg";
import json from "./assets/fileIcons/json/json.svg";
import css from "./assets/fileIcons/css/css.svg";
import postcss from "./assets/fileIcons/css/postcss.svg";
import scss from "./assets/fileIcons/css/scss-dark.svg";
import react from "./assets/fileIcons/js/react.svg";
import webpack from "./assets/fileIcons/js/webpack.svg";
import html from "./assets/fileIcons/html/html.svg";
import txt from "./assets/fileIcons/html/txt.svg";
import git from "./assets/fileIcons/git/git.svg";
import cc from "./assets/fileIcons/c/c.svg";
import cHash from "./assets/fileIcons/c/c++.svg";
import xml from "./assets/fileIcons/html/xml-file.svg";
import csv from "./assets/fileIcons/html/csv.svg";
import defaultFileIcon from "./assets/fileIcons/default/default-grey.svg";
import python from "./assets/fileIcons/python/python.svg";
import php from "./assets/fileIcons/php/php.svg";
import sql from "./assets/fileIcons/sql/sql.svg";
import rLang from "./assets/fileIcons/others/r.svg";
import ruby from "./assets/fileIcons/others/ruby.svg";
import swift from "./assets/fileIcons/others/swift.svg";
import java from "./assets/fileIcons/others/java.svg";
import julia from "./assets/fileIcons/others/julia.svg";
import ocaml from "./assets/fileIcons/others/ocaml.svg";
import go from "./assets/fileIcons/others/go.svg";
import coffee from "./assets/fileIcons/others/coffee.svg";
import clojure from "./assets/fileIcons/others/clojure.svg";
import docker from "./assets/fileIcons/others/docker.svg";
import jest from "./assets/fileIcons/others/jest.svg";
import test from "./assets/fileIcons/others/test.svg";
import mocha from "./assets/fileIcons/others/mocha.svg";
import hbs from "./assets/fileIcons/templates/handlebars.svg";
import next from "./assets/fileIcons/templates/nextjs.svg";
import nuxt from "./assets/fileIcons/templates/nuxt.svg";
import vue from "./assets/fileIcons/templates/vue.svg";

interface FileView {
  name: string;
  ext: string;
  saved: boolean;
  id: string;
  remove: (e: MouseEvent) => void;
  viewFile: () => void;
}

export function renderIcon(icon: string) {
  switch (icon) {
    case ".json":
    case ".jsonp":
      return `<object type="image/svg+xml" data=${json}></object>`;
    case ".js":
      return `<object type="image/svg+xml" data=${js}></object>`;
    case ".ts":
      return `<object type="image/svg+xml" data=${ts}></object>`;
    case ".vue":
      return `<object type="image/svg+xml" data=${vue}></object>`;
    case ".nuxt":
      return `<object type="image/svg+xml" data=${nuxt}></object>`;
    case ".next":
      return `<object type="image/svg+xml" data=${next}></object>`;
    case ".css":
      return `<object type="image/svg+xml" data=${css}></object>`;
    case ".scss":
      return `<object type="image/svg+xml" data=${scss}></object>`;
    case ".postcss":
      return `<object type="image/svg+xml" data=${postcss}></object>`;
    case ".html":
      return `<object type="image/svg+xml" data=${html}></object>`;
    case ".txt":
      return `<object type="image/svg+xml" data=${txt}></object>`;
    case ".cc":
      return `<object type="image/svg+xml" data=${cc}></object>`;
    case ".c":
      return `<object type="image/svg+xml" data=${cHash}></object>`;
    case ".xml":
      return `<object type="image/svg+xml" data=${xml}></object>`;
    case ".csv":
      return `<object type="image/svg+xml" data=${csv}></object>`;
    case ".py":
      return `<object type="image/svg+xml" data=${python}></object>`;
    case ".php":
      return `<object type="image/svg+xml" data=${php}></object>`;
    case ".sql":
      return `<object type="image/svg+xml" data=${sql}></object>`;
    case ".r":
      return `<object type="image/svg+xml" data=${rLang}></object>`;
    case ".rb":
      return `<object type="image/svg+xml" data=${ruby}></object>`;
    case ".swift":
      return `<object type="image/svg+xml" data=${swift}></object>`;
    case ".java":
      return `<object type="image/svg+xml" data=${java}></object>`;
    case ".ocaml":
      return `<object type="image/svg+xml" data=${ocaml}></object>`;
    case ".go":
      return `<object type="image/svg+xml" data=${go}></object>`;
    case ".coffee":
      return `<object type="image/svg+xml" data=${coffee}></object>`;
    case ".clj":
      return `<object type="image/svg+xml" data=${clojure}></object>`;
    case ".julia":
      return `<object type="image/svg+xml" data=${julia}></object>`;
    case ".jest":
      return `<object type="image/svg+xml" data=${jest}></object>`;
    case ".mocha":
      return `<object type="image/svg+xml" data=${mocha}></object>`;
    case ".test":
      return `<object type="image/svg+xml" data=${test}></object>`;
    case ".docker":
      return `<object type="image/svg+xml" data=${docker}></object>`;
    case ".jsx":
    case ".tsx":
      return `<object type="image/svg+xml" data=${react}></object>`;
    case ".git":
    case ".gitignore":
      return `<object type="image/svg+xml" data=${git}></object>`;
    case ".hbs":
    case ".handlebars":
    case ".mustache":
      return `<object type="image/svg+xml" data=${hbs}></object>`;
    case ".webpack":
    case ".webpack.config":
    case ".webpack.config.js":
    case ".webpack.config.ts":
      return `<object type="image/svg+xml" data=${webpack}></object>`;
      break;
    default:
      return `<object type="image/svg+xml" data=${defaultFileIcon}></object>`;
      break;
  }
}

export const FolderBlock = (props: {
  nested?: string;
  id: string;
  folder_name: string;
}) => {
  let className = props.nested
    ? `'explorer__content-folder ${props.nested}'`
    : `explorer__content-folder`;

  return `<div draggable="true" title=${props.folder_name} class=${className} id=${props.id} data-type="folder" data-folder_id=${props.id}>
      <div class="explorer__content-folder-group">
        <div class="explorer__content-folder-arrow">
            <span>
                <i class="fa-solid fa-angle-right"></i>
            </span>
        </div>
        <div class="explorer__content-folder-icon">
          <i class="fa-solid fa-folder-closed"></i>
        </div>
        <div class="explorer__content-folder-name">
          <span class="name__wrapper">${props.folder_name}</span>
        </div>
      </div>
    </div>
    `;
};

export const FileBlock = (props: {
  name: string;
  id: string;
  ext: string;
  file_id: string;
}) => {
  const { name, id, file_id, ext } = props;
  return `
    <div draggable="true" title=${
      props.name
    } class="explorer__content-file nested" data-type="file" id=${id} data-file_id=${file_id}>
      <div class="explorer__content-file-group">
        <div class="explorer__content-folder-arrow"></div>
        <div class="explorer__content-folder-icon">
          <span class="fileIcon__wrapper">
            ${renderIcon(ext)}
          </span>
        </div>
        <div class="explorer__content-folder-name">
          <span class="name__wrapper">${name}</span>
        </div>
      </div>
    </div>
    `;
};

export const FileView2 = (props: {
  name: string;
  ext: string;
  saved: boolean;
  id: string;
  fn: any;
}) => {
  return `
     <div class="explorer__view-header-files" data-file_view_id="${props.id}">
        <div class="explorer__view-header-files-container">
            <span class="icon">
                ${renderIcon(props.ext)}
            </span>
            <span class="name">${props.name}</span>
            <span class="status ${props.saved ? "status--visible" : ""}"></span>
            <span class="remove">x</span>
        </div>
    </div>
  `;
};

export const FileView = (props: FileView) => {
  const wrapper = document.createElement("div");
  const container = document.createElement("div");
  const icon = document.createElement("object");
  icon.setAttribute("type", "image/svg+xml");
  icon.setAttribute("data", "image/svg+xml");
  wrapper.setAttribute("data-file_view_id", props.id);
  wrapper.classList.add("explorer__view-header-files");
  container.classList.add("explorer__view-header-files-container");
  container.onclick = props.viewFile;

  ["icon", "name", "status", "remove"].forEach((i) => {
    const d = document.createElement("span");
    if (i === "icon") d.innerHTML = renderIcon(props.ext);
    if (i === "name") d.append(props.name);
    if (i === "status") d.append(props.saved ? "status--visible" : "");
    if (i === "remove") {
      d.onclick = props.remove;
      d.append("x");
    }
    d.classList.add(i);
    container.append(d);
    wrapper.append(container);
  });
  return wrapper;
};

export const SearchResult = (props: {
  ext: string;
  name: string;
  count: number;
  searchText: string;
  id: string;
  searchResult: string[];
  handleClick: (e: MouseEvent) => void;
  handleDelete: (e: MouseEvent) => void;
  handleResultDelete: (e: MouseEvent) => void;
  viewFile: (e: MouseEvent) => void;
}) => {
  const wrapper = document.createElement("div");
  const group = document.createElement("div");
  const name = document.createElement("span");
  const arrow = document.createElement("span");
  const count = document.createElement("span");
  const ext = document.createElement("span");
  const icon = document.createElement("i");
  const groupItem = document.createElement("div");
  const groupItem2 = document.createElement("div");
  const result = document.createElement("div");

  Object.assign(wrapper, {
    className: "search__result-wrapper",
    onclick: props.handleClick,
  });
  Object.assign(count, {
    className: "search__result-count",
    onclick: props.handleDelete,
  });
  wrapper.setAttribute("data-search_id", props.id);
  name.textContent = props.name;
  group.classList.add("search__result-group");
  arrow.classList.add("search__result-arrow");
  icon.classList.add(...["fa-solid", "fa-angle-right", "fa-rotate-90"]);
  name.classList.add("search__result-name");
  ext.classList.add("search__result-icon");
  result.classList.add("search__result-text");

  count.textContent = props.count.toString();
  ext.innerHTML = renderIcon(props.ext);
  arrow.appendChild(icon);
  groupItem.appendChild(arrow);
  groupItem.appendChild(ext);
  groupItem.appendChild(name);
  groupItem2.appendChild(count);
  group.appendChild(groupItem);
  group.appendChild(groupItem2);
  wrapper.appendChild(group);

  props.searchResult.forEach((i) => {
    if (i.length > 35) i = `${i.substring(0, 25)}...`;
    let newText = i.replace(
      props.searchText,
      `<span>${props.searchText}</span>`
    );
    const container = document.createElement("div");
    const el = document.createElement("p");
    const x = document.createElement("span");
    Object.assign(x, {
      className: "remove",
      onclick: props.handleResultDelete,
      textContent: "x",
    });
    // x.textContent = "x";
    el.innerHTML = newText;
    container.appendChild(el);
    container.appendChild(x);
    container.setAttribute("data-search_result_id", props.id);
    container.onclick = props.viewFile;
    result.appendChild(container);
  });
  wrapper.appendChild(result);

  return wrapper;

  // return `
  //     <div class="search__result-wrapper">
  //         <div class="search__result-group">
  //             <span id="search__result-arrow">
  //                 <i class="fa-solid fa-angle-right"></i>
  //             </span>
  //             <span class="search__result-name">${props.name}</span>
  //             <span class="search__result-count">${props.count}</span>
  //         </div>
  //         <div class="search__result-text nested">search text</div>
  //     </div>
  // `;
};

export const OpenEditorFile = (props: FileView) => {
  const container = document.createElement("div");
  const wrapper = document.createElement("div");
  const icon = document.createElement("object");
  icon.setAttribute("type", "image/svg+xml");
  icon.setAttribute("data", "image/svg+xml");
  container.classList.add("explorer__content-editor-container");
  container.setAttribute("data-editor_file_id", props.id);
  container.onclick = props.viewFile;
  wrapper.classList.add("explorer__content-editor-group");

  ["status", "icon", "name"].forEach((i) => {
    const d = document.createElement("span");
    if (i === "icon") d.innerHTML = renderIcon(props.ext);
    if (i === "name") d.append(props.name);
    if (i === "status") d.append(props.saved ? "status--visible" : "");
    if (i === "status") {
      d.onclick = props.remove;
      d.append("x");
    }
    d.classList.add(i);
    wrapper.appendChild(d);
    container.appendChild(wrapper);
  });
  return container;
};

export const TextField = (props: { isFileInput: boolean }) => {
  const textFieldIcon = props.isFileInput
    ? `<object type="image/svg+xml" data=${defaultFileIcon}></object>`
    : `<i class="fa-solid fa-folder-closed"></i>`;

  return `
    <div class="explorer__content-input" id="explorer__content-input" >
      <div class="explorer__content-input-group">
        <div class="explorer__content-input-icon">
        <span class="text__field-icon">
          ${textFieldIcon}
        </span>
        </div>
          <div class="explorer__content-input-textField" id="textField__wrapper">
            <input type="text" name="name" autocomplete="off"/>
          </div>
        </div>
    </div>
  `;
};

export const DropDownContext = () => {
  return `<div class="context" id="dropdown__context">
            <div class="context__container">
              <ul>
                <li id="add__file-context">
                  <span>Add file</span>
                </li>
                <li id="add__folder-context">
                  <span>Add folder</span>
                </li>
                <li id="rename">
                  <span>Rename</span>
                </li>
                <li id="delete">
                  <span>Delete</span>
                </li>
                <li id="copy">
                  <span>Copy</span>
                </li>
                <li id="paste">
                  <span>Paste</span>
                </li>
              </ul>
            </div>
          </div>
    `;
};

export const TextFieldErrorMessage = (props: { message: string }) => {
  return `<div class="explorer__content-textField-error" id="textFieldErrorBox">
      <span>${props.message}</span>
    </div>`;
};

export const BackdropWithSpinner = () => {
  return `
  <style>
    .loading-overlay {
        display: none;
        background: rgba(255, 255, 255, 0.7);
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        top: 0;
        z-index: 9998;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(2px)
        }

        .loading-overlay.is-active {
        display: flex;
        }

        .code {
        color: #dd4a68;
        background-color: rgb(238, 238, 238);
        padding: 0 3px;
    } 
  </style>
    <div class="loading-overlay is-active" id="loading-spinner">
        <span class="fas fa-spinner fa-3x fa-spin"></span>
    </div>
    `;
};

export const renderComponent = (component: string, element: string) => {
  let el = <HTMLElement>document.getElementById(element);
  el.innerHTML += component;
};

export const unmountComponent = (componentId: string) => {
  const el = <HTMLElement>document.getElementById(componentId);
  el?.remove();
};
