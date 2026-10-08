import { lazy, Suspense } from "react";
import AddTask from "./AddTask.jsx";
import Notepad from "./Notepad.jsx";
import { Icon } from "../icons.jsx";

const DASHBOARD_STYLES = String.raw`.lesson-section { margin-top: 31px; }
.section-heading { display: flex; align-items: end; justify-content: space-between; margin-bottom: 16px; }
.section-heading h2, .todo-header h2, .progress-card h2 { margin: 5px 0 4px; color: #2b3a31; font-family: var(--serif); font-size: 22.8px; font-weight: 800; letter-spacing: -.7px; }
.section-heading p, .progress-card > p { margin-bottom: 0; color: #929b92; font-size: 12px; }
.text-button { display: inline-flex; align-items: center; gap: 7px; padding: 6px 0; border: 0; color: #5a916a; background: transparent; font-size: 12px; font-weight: 700; }
.text-button:hover { color: #367448; }
.lesson-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.lesson-card { min-height: 185px; padding: 14px 14px 11px; border: 1px solid #edf0e9; border-radius: 12px; background: #fff; transition: transform .18s, box-shadow .18s; }
.lesson-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgb(45 68 48 / 5%); }
.lesson-topline { display: flex; align-items: center; justify-content: space-between; margin-bottom: 11px; }
.lesson-icon { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; font-size: 20.4px; }
.lesson-icon.lavender { background: #f0eafa; }.lesson-icon.mint { background: #e6f3e9; }.lesson-icon.peach { background: #fff0e8; }.lesson-icon.sky { background: #e9f2fa; }
.lesson-status { color: #a2aaa2; font-size: 8.4px; font-weight: 800; letter-spacing: .65px; }
.lesson-status.is-done { color: #55946a; }
.lesson-category { margin-bottom: 4px; color: #a0a79f; font-size: 10.8px; }
.lesson-card h3 { min-height: 34px; margin-bottom: 5px; color: #37463c; font-family: var(--serif); font-size: 14.4px; font-weight: 800; line-height: 1.35; }
.lesson-card > p { min-height: 27px; margin-bottom: 8px; color: #90998f; font-size: 10.8px; line-height: 1.45; }
.lesson-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 8px; border-top: 1px solid #f1f2ef; }
.lesson-footer > span { display: inline-flex; align-items: center; gap: 5px; color: #949d94; font-size: 10.8px; }
.lesson-action { display: grid; place-items: center; width: 27px; height: 27px; border: 0; border-radius: 8px; color: #fff; background: #65a478; transition: .16s; }
.lesson-action:hover { background: #43875c; transform: translateX(2px); }
.lesson-action.review-action { color: #60946e; background: #eef5ec; }
.study-path-section { margin-top: 29px; }
.path-progress-pill { flex: 0 0 auto; padding: 7px 10px; border: 1px solid #e5eee4; border-radius: 20px; color: #62836a; background: #f5f9f3; font-size: 10.8px; font-weight: 700; }
.study-path-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.study-path-card { display: flex; min-height: 205px; flex-direction: column; padding: 14px; border: 1px solid #e9eee7; border-radius: 12px; background: #fff; transition: border-color .18s, transform .18s, box-shadow .18s; }
.study-path-card:hover { transform: translateY(-2px); border-color: #cbdcca; box-shadow: 0 8px 20px rgb(45 68 48 / 5%); }
.study-path-card.is-next { border-color: #bcd9c0; background: linear-gradient(145deg, #fff 55%, #f5faf3); }
.study-path-card.is-reviewed { background: #fbfdf9; }
.study-path-card-top { display: flex; align-items: center; justify-content: space-between; gap: 7px; }
.study-path-number { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 9px; color: #598466; background: #edf5eb; font-size: 12px; font-weight: 800; }
.study-path-status { color: #a0a99e; font-size: 8.4px; font-weight: 800; letter-spacing: .55px; }
.study-path-status.is-reviewed { color: #55946a; }
.study-path-topic { margin-top: 12px; color: #909b90; font-size: 10.8px; }
.study-path-card h3 { margin: 4px 0 5px; color: #37463c; font-family: var(--serif); font-size: 15.6px; font-weight: 800; line-height: 1.35; }
.study-path-card > p { display: -webkit-box; overflow: hidden; min-height: 34px; margin: 0 0 12px; color: #879288; font-size: 10.8px; line-height: 1.5; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.study-path-card-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: auto; padding-top: 9px; border-top: 1px solid #eff2ed; }
.study-path-card-footer > span { display: inline-flex; align-items: center; gap: 5px; color: #929c92; font-size: 10.8px; white-space: nowrap; }
.study-path-action { display: inline-flex; align-items: center; gap: 6px; padding: 5px 7px; border: 0; border-radius: 6px; color: #4e855e; background: #f0f6ee; font-size: 10.8px; font-weight: 700; white-space: nowrap; }
.study-path-action:hover { color: #356b46; background: #e6f1e4; }
.path-loading { display: flex; align-items: center; justify-content: center; min-height: 125px; gap: 10px; color: #7e8b80; font-size: 12px; }
.path-load-error { display: flex; align-items: center; justify-content: space-between; min-height: 70px; padding: 12px 15px; border: 1px solid #f0dedb; border-radius: 10px; color: #a65e54; background: #fff9f8; font-size: 12px; }
.bottom-grid { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(220px, .9fr); gap: 14px; margin-top: 18px; }
.todo-card, .progress-card { position: relative; min-width: 0; padding: 19px; border: 1px solid #e8eee6; border-radius: 14px; background: #fff; }
.todo-header { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 14px; }
.todo-header { align-items: flex-start; }
.todo-header h2 { min-height: 32px; }
.todo-header h2 { display: flex; align-items: center; gap: 8px; }
.todo-total { display: inline-grid; flex: 0 0 auto; place-items: center; min-width: 20px; height: 20px; padding: 0 5px; border-radius: 7px; font-family: "DM Sans", sans-serif; font-size: 12px; line-height: 1; }

.add-task-button {
  display: inline-flex; flex: 0 0 auto; align-items: center; justify-content: center; gap: 6px;
  min-height: 36px; padding: 0 12px; border: 1px solid #dfe7dc; border-radius: 9px;
  color: #568664; background: #fff; font-size: 14.4px; font-weight: 700; cursor: pointer;
}
.add-task-button:hover { background: #f5faf4; }

.add-task-form {
  position: relative; display: grid; gap: 7px;
  width: min(580px, 100%);
}
.task-form-fields {
  display: grid; grid-template-columns: minmax(150px, 1fr) minmax(155px, auto) auto 34px;
  align-items: end; gap: 7px;
}
.task-form-fields > input, .task-deadline-field input {
  min-width: 0; height: 36px; padding: 0 10px;
  border: 1px solid #dfe7dc; border-radius: 9px; font-size: 15.6px;
  outline: none; transition: border-color .15s, box-shadow .15s;
}
.task-form-fields > input:focus, .task-deadline-field input:focus {
  border-color: #62a476; box-shadow: 0 0 0 3px rgb(98 164 118 / 18%);
}
.task-form-fields > input[aria-invalid="true"] { border-color: #d98a82; }
.task-form-fields input:disabled { background: #f6f8f5; }
.task-deadline-field { display: grid; min-width: 0; gap: 4px; color: #778278; font-size: 12px; }
.task-deadline-field small { color: #9ca49c; font-size: 10.8px; }
.task-deadline-field input { width: 100%; background: #fff; font-size: 13.2px; }

.task-form-fields > button[type="submit"] {
  min-height: 36px; padding: 0 12px; border: 0; border-radius: 9px; color: #fff;
  font-size: 13.2px; font-weight: 700; white-space: nowrap; cursor: pointer;
}
.task-form-fields > button[type="submit"]:hover:not(:disabled) { background: #509468; }
.task-form-fields > button:disabled { opacity: .5; cursor: not-allowed; }

.cancel-add {
  width: 34px; height: 36px; border: 1px solid #edf0e9; border-radius: 9px;
  color: #89958a; background: #fff; font-size: 24px; cursor: pointer;
}
.cancel-add:hover { background: #f3f5f2; color: #5f6c61; }

.task-form-meta {
  display: flex; grid-column: 1 / -1; justify-content: space-between;
  min-height: 14px; font-size: 13.2px;
}
.task-form-hint { color: #a2aaa1; }
.task-form-count { color: #8c978e; margin-left: auto; }
.task-form-error { position: static; max-width: none; font-size: 13.2px; color: #b2544d; }

.task-list { display: grid; }
.task-row {
  display: grid; grid-template-columns: 18px minmax(0, 1fr) auto 30px; align-items: center;
  min-width: 0; min-height: 48px; column-gap: 10px; border-bottom: 1px solid #edf0e9;
}
.task-check {
  display: grid; place-items: center; width: 18px; height: 18px; padding: 0;
  border: 1px solid #cbd8ca; border-radius: 6px; color: #fff; background: #fff;
  font-size: 14.4px; line-height: 1; cursor: pointer; transition: background .15s, border-color .15s;
}
.task-check:hover { border-color: #62a476; }
.task-check.checked { border-color: #4f9c71; color: #fff; background: #4f9c71; }
.task-title { min-width: 0; color: #48564b; font-size: 14.4px; line-height: 1.45; overflow-wrap: anywhere; }
.task-complete .task-title { color: #909a91; text-decoration: line-through; }
.task-due { padding: 5px 8px; border: 1px solid #f0dce3; border-radius: 20px; color: #a27484; background: #fff5f7; font-size: 12px; font-weight: 700; white-space: nowrap; }
.task-due.soon { border-color: #f2e5c9; color: #9c783c; background: #fffaf0; }
.task-due.overdue { border-color: #f0d2d0; color: #a8544d; background: #fff5f4; }
.task-due.no-deadline { border-color: #edf0e9; color: #98a098; background: #f9faf8; font-weight: 500; }
.task-delete {
  display: grid; place-items: center; width: 28px; height: 28px; padding: 0;
  border: 0; border-radius: 7px; color: #9aa39b; background: transparent;
  opacity: .65; transition: color .15s, background .15s, opacity .15s;
}
.task-row:hover .task-delete, .task-delete:focus-visible { opacity: 1; }
.task-delete:hover { color: #a94f6c; background: #fff0f4; }
.empty-tasks { display: grid; justify-items: center; padding: 20px 12px; color: #7e8b80; text-align: center; }
.empty-tasks > span { font-size: 30px; }
.empty-tasks p { max-width: 260px; margin: 7px 0 0; color: #8c978e; font-size: 13.2px; line-height: 1.6; }
.todo-summary { display: flex; align-items: center; gap: 8px; margin-top: 15px; color: #66786a; font-size: 13.2px; line-height: 1.5; }
.summary-check { display: grid; flex: 0 0 auto; place-items: center; width: 19px; height: 19px; border-radius: 6px; color: #fff; background: #4f9c71; font-size: 13.2px; font-weight: 800; }

/* delete is always visible on touch devices (no hover there) */
@media (hover: none) { .task-delete { opacity: 1; } }

@media (max-width: 640px) {
  .add-task-form { width: 100%; }
  .todo-header { flex-wrap: wrap; gap: 8px; }
  .task-form-fields { grid-template-columns: minmax(0, 1fr) auto 34px; }
  .task-form-fields > input { grid-column: 1 / -1; }
  .task-deadline-field { grid-column: 1; }
  .task-form-fields > button[type="submit"] { grid-column: 2; }
  .task-form-fields .cancel-add { grid-column: 3; }
  .task-row { grid-template-columns: 18px minmax(0, 1fr) auto 28px; column-gap: 7px; }
  .todo-card, .progress-card { padding: 15px; }
}
.page-content { max-width: 1120px; }
.page-title-row { margin: 13px 0 25px; }
.page-title-row h1 { margin: 7px 0 5px; color: #2b3a31; font-family: var(--serif); font-size: 32.4px; font-weight: 800; letter-spacing: -.8px; }
.page-title-row > p { margin: 0; color: #8b958c; font-size: 13.2px; }
.page-footer { margin-top: 28px; padding: 16px 0 4px; border-top: 1px solid #f0e8eb; color: #929b93; font-size: 12px; line-height: 1.5; text-align: center; }
.page-footer span { display: inline-block; margin-left: 4px; color: #d87594; }
.overview-welcome { margin-bottom: 22px; }
.overview-welcome h1 { font-size: 32.4px; }
.overview-date-pill { display: inline-flex; align-items: center; gap: 7px; padding: 9px 12px; border: 1px solid #f0dce3; border-radius: 10px; color: #a94f6c; background: #fff5f7; font-size: 12px; font-weight: 700; }
.review-stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.review-stat-card { display: grid; justify-items: start; min-height: 151px; padding: 15px; border: 1px solid; border-radius: 13px; }
.review-stat-green { border-color: #d1e5d1; background: linear-gradient(145deg, #f6fbf4, #eaf5e8); }
.review-stat-pink { border-color: #f0d6df; background: linear-gradient(145deg, #fff8fa, #fbedf1); }
.review-stat-icon { display: grid; place-items: center; width: 33px; height: 33px; margin-bottom: 9px; border-radius: 10px; color: #34754e; background: #dcefdc; }
.review-stat-pink .review-stat-icon { color: #a94f6c; background: #f8dce5; }
.review-stat-label { color: #7a897d; font-size: 9.6px; font-weight: 800; letter-spacing: .7px; }
.review-stat-pink .review-stat-label { color: #a27484; }
.review-stat-card > strong { margin-top: 3px; color: #315d3e; font-family: var(--serif); font-size: 30px; font-weight: 800; line-height: 1.15; }
.review-stat-pink > strong { color: #984b65; }
.review-stat-card > strong small { font-family: "DM Sans", sans-serif; font-size: 14.4px; font-weight: 700; }
.review-stat-note { margin-top: 4px; color: #89968c; font-size: 10.8px; }
.overview-review-card { padding: 19px; margin-top: 15px; border: 1px solid #f0dce3; border-radius: 14px; background: #fff; }
.overview-review-heading { display: flex; align-items: center; justify-content: space-between; gap: 15px; }
.overview-review-heading h2 { margin: 5px 0 4px; color: #704356; font-family: var(--serif); font-size: 21.6px; font-weight: 800; }
.overview-review-heading p { margin: 0; color: #929b92; font-size: 12px; }
.overview-review-heading > strong { color: #a94f6c; font-family: var(--serif); font-size: 31.2px; }
.overview-progress-track { height: 8px; overflow: hidden; margin-top: 15px; border-radius: 8px; background: #f5e8ec; }
.overview-progress-track span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #63a878, #d87594); transition: width .35s ease; }
.overview-unit-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 25px; margin-top: 10px; }
.overview-unit-row { display: flex; align-items: center; min-height: 42px; gap: 9px; border-bottom: 1px solid #f4eff0; }
.overview-unit-number { display: grid; flex: 0 0 auto; place-items: center; width: 23px; height: 23px; border-radius: 8px; color: #64846b; background: #edf5eb; font-size: 10.8px; font-weight: 800; }
.overview-unit-number.is-complete { color: #fff; background: #62a476; }
.overview-unit-name { overflow: hidden; color: #566258; font-size: 12px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.overview-unit-status { margin-left: auto; color: #a2aaa2; font-size: 9.6px; white-space: nowrap; }
.overview-unit-status.is-complete { color: #558666; }
.overview-units-error { grid-column: 1 / -1; padding: 12px 0; color: #a65e54; font-size: 12px; }
.overview-units-error .text-button { margin-left: 8px; }
.single-panel-grid { grid-template-columns: minmax(0, 1fr); }
.single-panel-grid .todo-card, .single-panel-grid .progress-card { min-height: 240px; }
.single-panel-grid .progress-review-count { position: absolute; right: 28px; bottom: 27px; color: #a27484; font-size: 12px; font-weight: 700; }
.single-panel-grid .progress-stats { margin-top: 34px; }
.single-panel-grid .progress-ring-wrap { right: 42px; }
.single-panel-grid .todo-card { max-width: 820px; }
.notepad-workspace { display: grid; grid-template-columns: minmax(210px, 270px) minmax(0, 1fr); min-height: 490px; overflow: hidden; border: 1px solid #f0dce3; border-radius: 14px; background: #fff; box-shadow: 0 8px 24px rgb(180 84 117 / 5%); }
.notes-list-panel { min-width: 0; padding: 17px 13px; border-right: 1px solid #f1e7ea; background: #fffafb; }
.notes-list-heading { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 0 3px 13px; }
.notes-list-heading h2 { margin: 5px 0 0; color: #704356; font-family: var(--serif); font-size: 19.2px; font-weight: 800; }
.notes-new-button { display: grid; place-items: center; width: 32px; height: 32px; padding: 0; border: 1px solid #efdae2; border-radius: 9px; color: var(--pink-dark); background: #fff; }
.notes-new-button:hover { background: #fff0f4; }
.notes-new-button:disabled { cursor: wait; opacity: .6; }
.notes-folder-list { display: grid; gap: 3px; margin-bottom: 9px; }
.notes-folder-item { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-width: 0; padding: 7px 9px; border: 1px solid transparent; border-radius: 7px; color: #806d74; background: transparent; font-size: 12px; text-align: left; }
.notes-folder-item > span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.notes-folder-item > span:last-child { flex: 0 0 auto; color: #aa9aa0; font-size: 10.8px; }
.notes-folder-item:hover { background: #fff3f6; }
.notes-folder-item.selected { border-color: #f0d8e0; color: #844d62; background: #fff0f4; font-weight: 700; }
.notes-folder-item.drop-target { border-color: var(--pink); color: #844d62; background: #ffe8ef; box-shadow: 0 0 0 2px rgb(223 139 164 / 16%); }
.notes-folder-form { display: flex; gap: 5px; margin: 0 0 12px; }
.notes-folder-form input { width: 100%; min-width: 0; padding: 7px 8px; border: 1px solid #efdae2; border-radius: 7px; color: #536258; background: #fff; font-size: 10.8px; }
.notes-folder-add { display: grid; flex: 0 0 29px; place-items: center; padding: 0; border: 1px solid #efdae2; border-radius: 7px; color: var(--pink-dark); background: #fff; }
.notes-folder-add:hover { background: #fff0f4; }
.notes-folder-add:disabled { cursor: not-allowed; opacity: .55; }
.notes-folder-hint { margin: 0 0 9px; color: #a19499; font-size: 10.8px; line-height: 1.5; }
.notes-folder-feedback { margin: 0 0 9px; padding: 7px 8px; border: 1px solid #e2eee4; border-radius: 7px; color: #577b5f; background: #f4faf4; font-size: 10.8px; line-height: 1.5; overflow-wrap: anywhere; }
.notes-folder-feedback.error { border-color: #f0d7d1; color: #a65e54; background: #fff7f5; }
.notes-list { display: grid; gap: 6px; }
.note-list-item { display: grid; gap: 5px; min-width: 0; padding: 11px 10px; border: 1px solid transparent; border-radius: 9px; color: #526056; background: transparent; text-align: left; }
.note-list-item[draggable="true"] { cursor: grab; }
.note-list-item[draggable="true"]:active { cursor: grabbing; }
.note-list-item.dragging { opacity: .45; }
.note-list-item:hover { background: #fff3f6; }
.note-list-item.selected { border-color: #f0d8e0; color: #844d62; background: #fff0f4; }
.note-list-item strong { overflow: hidden; font-size: 13.2px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.note-list-item span { overflow: hidden; color: #929b93; font-size: 10.8px; line-height: 1.5; text-overflow: ellipsis; white-space: nowrap; }
.notes-empty-list { display: grid; justify-items: center; padding: 27px 11px; color: #9a8790; text-align: center; }
.notes-empty-list > span, .note-editor-empty > span { color: var(--pink); font-size: 30px; }
.notes-empty-list p { margin: 7px 0 0; font-size: 12px; line-height: 1.6; }
.note-editor { display: flex; flex-direction: column; min-width: 0; min-height: 490px; padding: 17px 20px 15px; }
.note-editor-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid #f3ecee; }
.note-save-status { color: #73927a; font-size: 10.8px; }
.note-save-status.unsaved { color: #a85d45; }
.note-editor-actions { display: flex; align-items: center; gap: 8px; }
.note-delete-button { display: inline-flex; align-items: center; gap: 5px; padding: 7px 8px; border: 0; border-radius: 7px; color: #9a7b85; background: transparent; font-size: 10.8px; }
.note-delete-button:hover { color: #a94f6c; background: #fff0f4; }
.note-delete-button:disabled { cursor: wait; opacity: .6; }
.note-save-button { min-height: 32px; padding: 0 11px; font-size: 10.8px; }
.note-save-button:disabled { cursor: not-allowed; opacity: .55; }
.note-folder-select { align-self: flex-start; max-width: 100%; margin-top: 14px; padding: 6px 9px; border: 1px solid #efdae2; border-radius: 7px; color: #806d74; background: #fffafb; font-size: 12px; }
.note-title-input { width: 100%; margin-top: 19px; padding: 4px 0 10px; border: 0; border-bottom: 1px solid transparent; color: #3f5145; background: transparent; font-family: var(--serif); font-size: 26.4px; font-weight: 800; letter-spacing: -.5px; }
.note-title-input::placeholder { color: #b7bdb6; }
.note-title-input:focus { border-bottom-color: #efd7df; outline: none; }
.note-content-input { flex: 1; width: 100%; min-height: 330px; resize: vertical; padding: 14px 0 0; border: 0; color: #536258; background: transparent; font-size: 14.4px; line-height: 1.8; }
.note-content-input::placeholder { color: #a9b0a8; }
.note-content-input:focus { outline: none; }
.notes-message { display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 250px; color: #7e8b80; font-size: 13.2px; }
.notes-error { color: #a65e54; font-size: 12px; line-height: 1.5; }
.note-editor > .notes-error { margin-top: 8px; }
.notes-message .text-button { margin-left: 0; }
.note-editor-empty { display: grid; flex: 1; align-content: center; justify-items: center; padding: 25px; text-align: center; }
.note-editor-empty h2 { margin: 10px 0 5px; color: #704356; font-family: var(--serif); font-size: 21.6px; font-weight: 800; }
.note-editor-empty p { max-width: 290px; margin: 0 0 14px; color: #929b93; font-size: 12px; line-height: 1.6; }
.note-editor-empty .button { min-height: 35px; gap: 7px; font-size: 12px; }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; clip-path: inset(50%); }

/* ================= GLASSMORPHISM LAYER ================= */
.page-content {
  --glass-bg: rgb(255 255 255 / 40%);
  --glass-bg-strong: rgb(255 255 255 / 58%);
  --glass-border: rgb(255 255 255 / 70%);
  --glass-shadow: 0 8px 32px rgb(60 90 80 / 12%), inset 0 1px 0 rgb(255 255 255 / 80%);
  --glass-blur: blur(18px) saturate(165%);
  position: relative;
  isolation: isolate;
}

/* soft colour blobs behind the glass so the blur has something to show */
.page-content::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(520px 420px at 12% 8%, rgb(120 200 150 / 45%), transparent 70%),
    radial-gradient(480px 460px at 88% 14%, rgb(240 140 175 / 38%), transparent 70%),
    radial-gradient(560px 480px at 70% 92%, rgb(150 170 240 / 34%), transparent 70%),
    radial-gradient(420px 380px at 8% 85%, rgb(255 190 150 / 34%), transparent 70%);
}

/* glass surfaces */
.lesson-card,
.study-path-card,
.todo-card,
.progress-card,
.overview-review-card,
.notepad-workspace,
.path-load-error {
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  -webkit-backdrop-filter: var(--glass-blur);
  backdrop-filter: var(--glass-blur);
  box-shadow: var(--glass-shadow);
}
.study-path-card.is-next {
  border-color: rgb(140 210 160 / 85%);
  background: linear-gradient(145deg, rgb(255 255 255 / 52%), rgb(190 235 200 / 34%));
}
.study-path-card.is-reviewed { background: rgb(255 255 255 / 48%); }

/* tinted stat cards */
.review-stat-card {
  border: 1px solid var(--glass-border);
  -webkit-backdrop-filter: var(--glass-blur);
  backdrop-filter: var(--glass-blur);
  box-shadow: var(--glass-shadow);
}
.review-stat-green { background: linear-gradient(145deg, rgb(255 255 255 / 45%), rgb(130 200 150 / 28%)); }
.review-stat-pink  { background: linear-gradient(145deg, rgb(255 255 255 / 45%), rgb(240 140 175 / 26%)); }
.review-stat-icon { background: rgb(255 255 255 / 60%); box-shadow: inset 0 1px 0 rgb(255 255 255 / 80%); }
.review-stat-pink .review-stat-icon { background: rgb(255 255 255 / 60%); }

/* lift on hover */
.lesson-card:hover,
.study-path-card:hover {
  background: var(--glass-bg-strong);
  border-color: rgb(255 255 255 / 90%);
  box-shadow: 0 14px 36px rgb(60 90 80 / 18%), inset 0 1px 0 rgb(255 255 255 / 90%);
}

/* pills and buttons */
.path-progress-pill,
.overview-date-pill,
.add-task-button,
.notes-new-button,
.notes-folder-add,
.study-path-action,
.cancel-add {
  border: 1px solid var(--glass-border);
  background: rgb(255 255 255 / 45%);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 80%);
}
.add-task-button:hover,
.notes-new-button:hover,
.notes-folder-add:hover,
.study-path-action:hover,
.cancel-add:hover { background: rgb(255 255 255 / 70%); }
.lesson-action.review-action { background: rgb(255 255 255 / 55%); }

/* inputs */
.task-form-fields > input,
.task-deadline-field input,
.notes-folder-form input,
.note-folder-select {
  border: 1px solid var(--glass-border);
  background: rgb(255 255 255 / 50%);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}
.task-form-fields > input:focus,
.task-deadline-field input:focus { background: rgb(255 255 255 / 75%); }
.task-form-fields input:disabled { background: rgb(255 255 255 / 30%); }

/* tasks */
.task-row { border-bottom: 1px solid rgb(255 255 255 / 55%); }
.task-check { border: 1px solid rgb(150 190 160 / 80%); background: rgb(255 255 255 / 55%); }
.task-check.checked { border-color: #4f9c71; background: #4f9c71; }
.task-due,
.task-due.soon,
.task-due.overdue,
.task-due.no-deadline {
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  background-color: rgb(255 255 255 / 50%);
}
.task-delete:hover { background: rgb(255 255 255 / 70%); }

/* dividers inside cards */
.lesson-footer,
.study-path-card-footer { border-top: 1px solid rgb(255 255 255 / 60%); }
.overview-unit-row { border-bottom: 1px solid rgb(255 255 255 / 55%); }
.overview-unit-number { background: rgb(255 255 255 / 60%); }
.overview-unit-number.is-complete { background: #62a476; }
.overview-progress-track { background: rgb(255 255 255 / 55%); box-shadow: inset 0 1px 2px rgb(60 90 80 / 12%); }
.page-footer { border-top: 1px solid rgb(255 255 255 / 60%); }

/* notepad */
.notes-list-panel { border-right: 1px solid rgb(255 255 255 / 60%); background: rgb(255 255 255 / 28%); }
.notes-folder-item:hover,
.note-list-item:hover { background: rgb(255 255 255 / 50%); }
.notes-folder-item.selected,
.note-list-item.selected { border-color: var(--glass-border); background: rgb(255 255 255 / 65%); }
.notes-folder-item.drop-target { background: rgb(255 255 255 / 75%); }
.notes-folder-feedback { background: rgb(255 255 255 / 55%); }
.note-editor-toolbar { border-bottom: 1px solid rgb(255 255 255 / 60%); }
.note-title-input:focus { border-bottom-color: rgb(255 255 255 / 90%); }

/* fallbacks */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .lesson-card, .study-path-card, .todo-card, .progress-card,
  .overview-review-card, .notepad-workspace, .review-stat-card { background: rgb(255 255 255 / 85%); }
}
@media (prefers-reduced-transparency: reduce) {
  .lesson-card, .study-path-card, .todo-card, .progress-card,
  .overview-review-card, .notepad-workspace, .review-stat-card,
  .path-progress-pill, .overview-date-pill, .add-task-button {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    background: #fff;
  }
}`;

const PdfToText = lazy(() => import("./PdfToText.jsx"));

function getTaskDeadline(task) {
  if (!task.dueDate) {
    if (!task.dueLabel || task.dueLabel === "No deadline") return null;
    return { label: task.dueLabel, tone: "" };
  }

  const today = new Date();
  const todayValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowValue = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
  if (task.dueDate < todayValue) {
    const dateLabel = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
      new Date(`${task.dueDate}T00:00:00`),
    );
    return { label: `Overdue · ${dateLabel}`, tone: task.completed ? "" : "overdue" };
  }
  if (task.dueDate === todayValue) return { label: "Due today", tone: "soon" };
  if (task.dueDate === tomorrowValue) return { label: "Due tomorrow", tone: "soon" };
  const dateLabel = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
    new Date(`${task.dueDate}T00:00:00`),
  );
  return { label: `Due ${dateLabel}`, tone: "" };
}

export default function DashboardPages({
  activeNav,
  todayLabel,
  dashboard,
  taskStats,
  reviewStats,
  studyState,
  actions,
}) {
  const { tasks, progress } = dashboard;
  const { unfinishedTasks, completedTasks } = taskStats;
  const {
    completedStudyQuizzes,
    completedReviewCount,
    reviewPathLength,
    reviewCompletionPercent,
  } = reviewStats;
  const {
    studyGuides,
    studyGuidesLoading,
    studyGuidesError,
    reviewedGuideCount,
    reviewedGuideSlugs,
    nextGuideSlug,
  } = studyState;

  return (
    <>
      {activeNav === "home" && (
        <>
          <section className="welcome-row overview-welcome">
            <div>
              <div className="eyebrow">{todayLabel} <span className="tiny-sun">✳</span></div>
              <h1>Your review, at a glance <span className="wave">✋</span></h1>
              <p className="welcome-subtitle">Welcome back, Elys. Here’s how your road to topnotcher is going.</p>
            </div>
            <div className="overview-date-pill"><Icon name="chart" size={17} /> Review statistics</div>
          </section>
          <section className="review-stats-grid" aria-label="Review statistics">
            <article className="review-stat-card review-stat-green">
              <span className="review-stat-icon"><Icon name="book" size={20} /></span>
              <span className="review-stat-label">CCN QUIZZES COMPLETED</span>
              <strong>{completedReviewCount}<small> / {reviewPathLength}</small></strong>
              <span className="review-stat-note">study-unit quizzes passed</span>
            </article>
            <article className="review-stat-card review-stat-pink">
              <span className="review-stat-icon"><Icon name="spark" size={20} /></span>
              <span className="review-stat-label">TOTAL XP</span>
              <strong>{progress.xp}</strong>
              <span className="review-stat-note">points earned from practice</span>
            </article>
            <article className="review-stat-card review-stat-pink">
              <span className="review-stat-icon"><Icon name="clock" size={20} /></span>
              <span className="review-stat-label">STUDY TIME THIS WEEK</span>
              <strong>{progress.weeklyMinutes}<small> min</small></strong>
              <span className="review-stat-note">time spent reviewing</span>
            </article>
            <article className="review-stat-card review-stat-green">
              <span className="review-stat-icon"><Icon name="flame" size={20} /></span>
              <span className="review-stat-label">CURRENT STREAK</span>
              <strong>{progress.streak}<small> days</small></strong>
              <span className="review-stat-note">keep showing up for yourself</span>
            </article>
          </section>
          <section className="overview-review-card">
            <div className="overview-review-heading">
              <div>
                <div className="section-kicker">YOUR CCN REVIEW</div>
                <h2>Road to topnotcher</h2>
                <p>Quiz completion across your six study units.</p>
              </div>
              <strong>{reviewCompletionPercent}%</strong>
            </div>
            <div className="overview-progress-track">
              <span style={{ width: `${reviewCompletionPercent}%` }} />
            </div>
            <div className="overview-unit-list">
              {studyGuides.map((guide, index) => {
                const completed = completedStudyQuizzes.includes(guide.slug);
                return (
                  <div className="overview-unit-row" key={guide.slug}>
                    <span className={`overview-unit-number ${completed ? "is-complete" : ""}`}>
                      {completed ? "✓" : String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="overview-unit-name">{guide.topic}</span>
                    <span className={`overview-unit-status ${completed ? "is-complete" : ""}`}>
                      {completed ? "Quiz completed" : "Not completed yet"}
                    </span>
                  </div>
                );
              })}
              {!studyGuidesLoading && studyGuides.length === 0 && studyGuidesError && (
                <div className="overview-units-error" role="alert">
                  {studyGuidesError}
                  <button className="text-button" onClick={actions.loadStudyGuides}>Try again</button>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {activeNav === "path" && (
        <section className="lesson-section study-path-section" id="study-path-section">
          <div className="section-heading">
            <div>
              <div className="section-kicker">YOUR LEARNING PATH</div>
              <h2>Study it, then remember it</h2>
              <p>Choose a study unit to open its reading guide, then review its matching flashcards in the Study Room.</p>
            </div>
            <span className="path-progress-pill">{reviewedGuideCount} / {studyGuides.length || 6} reviewed</span>
          </div>
          {studyGuidesError ? (
            <div className="path-load-error" role="alert">
              <span>{studyGuidesError}</span>
              <button className="text-button" onClick={actions.loadStudyGuides}>Try again <Icon name="arrow" size={16} /></button>
            </div>
          ) : studyGuidesLoading ? (
            <div className="path-loading"><span className="loader" /> Loading your study units…</div>
          ) : (
            <div className="study-path-grid">
              {studyGuides.map((guide, index) => {
                const isReviewed = reviewedGuideSlugs.includes(guide.slug);
                const isNext = guide.slug === nextGuideSlug;
                return (
                  <article className={`study-path-card ${isReviewed ? "is-reviewed" : ""} ${isNext ? "is-next" : ""}`} key={guide.slug}>
                    <div className="study-path-card-top">
                      <span className="study-path-number">{String(index + 1).padStart(2, "0")}</span>
                      <span className={`study-path-status ${isReviewed ? "is-reviewed" : ""}`}>
                        {isReviewed ? "✓ REVIEWED" : isNext ? "UP NEXT" : "READY WHEN YOU ARE"}
                      </span>
                    </div>
                    <div className="study-path-topic">{guide.topic}</div>
                    <h3>{guide.title}</h3>
                    <p>{guide.introduction}</p>
                    <div className="study-path-card-footer">
                      <span><Icon name="clock" size={15} />{guide.readTime}</span>
                      <button
                        className="study-path-action"
                        onClick={() => actions.openStudyRoom(guide.slug)}
                        aria-label={`${isReviewed ? "Review" : "Study"} ${guide.topic}`}
                      >
                        {isReviewed ? "Review unit" : "Study unit"} <Icon name="arrow" size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {activeNav === "quiz" && (
        <section className="lesson-section quiz-practice-section" id="lessons-section">
          <div className="section-heading">
            <div>
              <div className="section-kicker">QUICK QUIZ PRACTICE</div>
              <h2>Test what you know</h2>
              <p>Take the same 10-question CCN quizzes available beside the flashcards in each Study Room unit.</p>
            </div>
          </div>
          {studyGuidesError ? (
            <div className="path-load-error" role="alert">
              <span>{studyGuidesError}</span>
              <button className="text-button" onClick={actions.loadStudyGuides}>Try again <Icon name="arrow" size={16} /></button>
            </div>
          ) : studyGuidesLoading ? (
            <div className="path-loading"><span className="loader" /> Loading your quizzes…</div>
          ) : (
            <div className="lesson-grid">
              {studyGuides.map((guide, index) => (
                <article className={`lesson-card study-quiz-card ${index % 2 === 0 ? "mint" : "peach"}`} key={guide.slug}>
                  <div className="lesson-topline">
                    <span className={`lesson-icon ${index % 2 === 0 ? "mint" : "peach"}`}>📘</span>
                    <span className="lesson-status">10 QUESTIONS</span>
                  </div>
                  <div className="lesson-category">{guide.topic}</div>
                  <h3>{guide.title}</h3>
                  <p>Check your understanding with the 10-question Study Room quiz for this unit.</p>
                  <div className="lesson-footer">
                    <span><Icon name="clock" size={15} />10 questions</span>
                    <button
                      className="lesson-action"
                      onClick={() => actions.startStudyGuideQuiz(guide.slug)}
                      aria-label={`Take ${guide.topic} quiz`}
                    >
                      <Icon name="arrow" size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {(activeNav === "check" || activeNav === "chart") && (
        <div className="bottom-grid single-panel-grid">
          {activeNav === "check" && (
            <section className="todo-card" id="todo-section">
              <div className="todo-header">
                <div>
                  <div className="section-kicker">STAY ON TRACK</div>
                  <h2>Today’s to-dos <span className="todo-total">{unfinishedTasks.length}</span></h2>
                </div>
                <AddTask onAdd={actions.addTask} />
              </div>
              {tasks.length === 0 ? (
                <div className="empty-tasks"><span>🌱</span><p>Nothing on your list yet. Add a little goal to get started.</p></div>
              ) : (
                <div className="task-list">
                  {tasks.map((task) => {
                    const deadline = getTaskDeadline(task);
                    return (
                    <div className={`task-row ${task.completed ? "task-complete" : ""}`} key={task.id}>
                      <button
                        className={`task-check ${task.completed ? "checked" : ""}`}
                        onClick={() => actions.toggleTask(task)}
                        aria-label={`${task.completed ? "Mark incomplete" : "Complete"} ${task.title}`}
                      >
                        {task.completed && "✓"}
                      </button>
                      <span className="task-title">{task.title}</span>
                      {deadline ? (
                        <span className={`task-due ${deadline.tone}`}>{deadline.label}</span>
                      ) : (
                        <span className="task-due no-deadline">No deadline</span>
                      )}
                      <button
                        className="task-delete"
                        onClick={() => actions.removeTask(task.id)}
                        aria-label={`Delete ${task.title}`}
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    </div>
                    );
                  })}
                </div>
              )}
              <div className="todo-summary">
                <span className="summary-check">✓</span>
                {completedTasks === 0
                  ? "You’ve got this — one task at a time."
                  : `${completedTasks} of ${tasks.length} tasks complete. Nice work!`}
              </div>
            </section>
          )}

          {activeNav === "chart" && (
            <section className="progress-card" id="progress-card">
              <div className="section-kicker">YOUR MOMENTUM</div>
              <h2>Look at you go.</h2>
              <p>Every little session adds up.</p>
              <div className="progress-ring-wrap">
                <svg className="progress-ring" width="130" height="130" viewBox="0 0 130 130" aria-label={`${completedReviewCount} of ${reviewPathLength} CCN quizzes complete`}>
                  <circle cx="65" cy="65" r="54" fill="none" stroke="#edf0e9" strokeWidth="10" />
                  <circle
                    cx="65"
                    cy="65"
                    r="54"
                    fill="none"
                    stroke="#57a87a"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${Math.max(completedReviewCount / reviewPathLength, 0.03) * 339} 339`}
                    transform="rotate(-90 65 65)"
                  />
                </svg>
                <div className="ring-text"><strong>{reviewCompletionPercent}<small>%</small></strong><span>of CCN quizzes</span></div>
                <span className="ring-leaf">✳</span>
              </div>
              <div className="progress-stats">
                <div><span className="stat-icon xp-mini">✳</span><strong>{progress.xp}</strong><small>Total XP</small></div>
                <div><span className="stat-icon streak-mini">↗</span><strong>{progress.streak} days</strong><small>Current streak</small></div>
              </div>
              <div className="progress-review-count">{completedReviewCount} of {reviewPathLength} study-unit quizzes completed</div>
            </section>
          )}
        </div>
      )}

      <Notepad active={activeNav === "notes"} />
      {activeNav === "pdf" && (
        <Suspense fallback={<div className="pdf-conversion-status" role="status">Loading PDF tools…</div>}>
          <PdfToText onGenerated={actions.onGeneratedStudyGuide} />
        </Suspense>
      )}
      <footer className="page-footer">Made for the nurse you’re becoming <span>✳</span></footer>
    </>
  );
}