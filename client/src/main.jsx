import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

const GLOBAL_BASE_STYLES = String.raw`:root {
  font-family: "DM Sans", sans-serif;
  color: #25352d;
  background: #f7f8f4;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  --ink: #25352d;
  --muted: #8c978e;
  --green: #4f9c71;
  --green-dark: #377951;
  --line: #edf0e9;
  --serif: "Manrope", sans-serif;
}

* { box-sizing: border-box; }
body { margin: 0; min-width: 360px; min-height: 100vh; }
button, input { font: inherit; }
textarea { font: inherit; }
button { cursor: pointer; }
button:focus-visible, input:focus-visible, textarea:focus-visible, a:focus-visible { outline: 3px solid #9bd3ae; outline-offset: 3px; }
.app-shell { min-height: 100vh; }
.sidebar { position: fixed; inset: 0 auto 0 0; z-index: 5; width: 246px; display: flex; flex-direction: column; padding: 31px 19px 17px; background: #fff; border-right: 1px solid #eef0eb; }
.brand { display: inline-flex; align-items: center; gap: 10px; width: fit-content; margin: 0 0 53px 6px; color: var(--ink); text-decoration: none; }
.brand-mark { position: relative; display: grid; place-items: center; width: 35px; height: 35px; border-radius: 12px; background: #e5f3e9; color: #3c8659; font-size: 25.2px; font-weight: 800; letter-spacing: -2px; }
.brand-mark span { position: absolute; right: 5px; top: 4px; font-size: 12px; letter-spacing: 0; }
.brand-name { font-family: var(--serif); font-size: 22.8px; font-weight: 800; letter-spacing: -1px; }
.brand-name span { color: #5da778; }
.nav-label, .section-kicker { color: #9aa49a; font-size: 12px; font-weight: 800; letter-spacing: 1.35px; }
.nav-label { padding-left: 11px; margin-bottom: 12px; }
.main-nav { display: grid; min-height: 0; gap: 5px; overflow-y: auto; }
.nav-item { display: flex; align-items: center; gap: 13px; width: 100%; height: 47px; padding: 0 12px; border: 0; border-radius: 10px; background: transparent; color: #818c83; text-align: left; font-size: 15.6px; font-weight: 600; transition: .18s ease; }
.nav-item:hover { background: #f7f9f6; color: var(--ink); }
.nav-item.active { color: #43845d; background: #edf6ef; font-weight: 700; }
.nav-count { display: grid; place-items: center; width: 20px; height: 20px; margin-left: auto; border-radius: 50%; background: #e5eee6; color: #64826d; font-size: 12px; }
.sidebar-bottom { margin-top: auto; }
.sidebar-note { padding: 16px 14px 15px; margin-bottom: 19px; border: 1px solid #eaf0e9; border-radius: 13px; background: #fbfcf9; }
.note-spark { display: grid; place-items: center; width: 29px; height: 29px; border-radius: 9px; color: #70a481; background: #edf5eb; }
.sidebar-note p { margin: 12px 0 5px; font-family: var(--serif); font-size: 14.4px; font-weight: 700; line-height: 1.5; }
.sidebar-note > span { color: #929b91; font-size: 12px; }
.profile { display: flex; align-items: center; width: 100%; padding: 10px 2px 5px; border: 0; border-top: 1px solid #f0f1ed; background: #fff; text-align: left; }
.avatar, .top-avatar { display: grid; place-items: center; flex: 0 0 auto; border-radius: 50%; color: #477958; background: #e8f0df; font-family: var(--serif); font-weight: 800; }
.avatar { width: 35px; height: 35px; font-size: 15.6px; }
.profile-copy { display: grid; gap: 3px; margin-left: 10px; }
.profile-copy strong { color: #3a493f; font-size: 13.2px; }
.profile-copy small { color: #969f95; font-size: 12px; }
.profile-dots { margin-left: auto; color: #939d92; font-size: 26.4px; letter-spacing: 1px; }
.main-content { min-height: 100vh; margin-left: 246px; }
.topbar { position: sticky; top: 0; z-index: 4; display: flex; align-items: center; justify-content: space-between; height: 65px; padding: 0 46px; border-bottom: 1px solid #ecefe9; background: rgb(247 248 244 / 93%); backdrop-filter: blur(10px); }
.breadcrumb { color: #9aa197; font-size: 13.2px; }
.breadcrumb span { padding: 0 9px; color: #c3c9c1; }
.breadcrumb strong { color: #59665d; font-weight: 600; }
.topbar-right { display: flex; align-items: center; gap: 20px; }
.top-stat { display: flex; align-items: center; gap: 6px; font-size: 13.2px; }
.top-stat strong { color: #38473e; font-weight: 800; }
.top-stat > span:last-child { color: #939b93; }
.flame-icon { display: flex; color: #e5a04b; }
.xp-star { color: #c5a545; font-size: 20.4px; }
.top-avatar { width: 31px; height: 31px; margin-left: 4px; font-size: 14.4px; }
.page-content { width: min(1120px, 100%); padding: 32px 46px 22px; margin: 0 auto; }
.welcome-row { display: flex; align-items: end; justify-content: space-between; margin-bottom: 25px; }
.eyebrow { color: #98a198; font-size: 10.8px; font-weight: 800; letter-spacing: 1.35px; }
.tiny-sun { margin-left: 5px; color: #86ad79; }
h1, h2, h3, p { margin-top: 0; }
.welcome-row h1 { margin: 8px 0 5px; color: #28382f; font-family: var(--serif); font-size: 34.8px; font-weight: 800; letter-spacing: -1.2px; }
.wave { display: inline-block; font-family: "DM Sans", sans-serif; font-size: 27.6px; transform: rotate(-20deg); }
.welcome-subtitle { margin-bottom: 0; color: #8b958c; font-size: 14.4px; }
.weekly-pill { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border: 1px solid #e9eee6; border-radius: 10px; background: #fff; color: #8d978d; font-size: 12px; }
.weekly-pill strong { color: #4b6554; font-size: 13.2px; }
.weekly-icon { color: #71977b; font-size: 20.4px; }
.weekly-arrow { padding-left: 5px; color: #70a580; font-size: 18px; }
.hero-card { position: relative; display: flex; min-height: 258px; overflow: hidden; padding: 29px 36px; border-radius: 18px; background: #e3f0e4; }
.hero-copy { position: relative; z-index: 2; width: 55%; }
.hero-kicker { display: inline-flex; align-items: center; gap: 7px; color: #6f9074; font-size: 10.8px; font-weight: 800; letter-spacing: 1.15px; }
.hero-kicker-dot { width: 6px; height: 6px; border-radius: 50%; background: #68a578; }
.hero-card h2 { margin: 11px 0 8px; color: #263b2e; font-family: var(--serif); font-size: 37.2px; font-weight: 800; line-height: 1.13; letter-spacing: -1.3px; }
.hero-card h2 span { color: #508d62; }
.hero-card p { margin-bottom: 15px; color: #738779; font-size: 13.2px; }
.button { display: inline-flex; align-items: center; justify-content: center; gap: 15px; min-height: 38px; padding: 0 15px; border: 0; border-radius: 8px; font-size: 13.2px; font-weight: 700; transition: transform .16s, background .16s; }
.button:hover { transform: translateY(-1px); }
.button-white { color: #397a53; background: #fff; box-shadow: 0 3px 9px rgb(53 99 63 / 8%); }
.button-white:hover { background: #f9fff9; }
.hero-progress-label { display: flex; width: 248px; justify-content: space-between; margin-top: 19px; color: #79907c; font-size: 9.6px; font-weight: 800; letter-spacing: .8px; }
.hero-progress-label strong { color: #64856b; font-size: 10.8px; letter-spacing: 0; }
.hero-progress-track { width: 248px; height: 4px; margin-top: 7px; overflow: hidden; border-radius: 4px; background: #cddfcf; }
.hero-progress-track span { display: block; height: 100%; border-radius: inherit; background: #64a378; transition: width .5s; }
.hero-illustration { position: absolute; top: 0; right: 7%; width: 42%; height: 100%; }
.orbit { position: absolute; top: 50%; left: 50%; border: 1px solid rgb(100 144 107 / 11%); border-radius: 50%; transform: translate(-50%, -50%); }
.orbit-one { width: 221px; height: 221px; }
.orbit-two { width: 176px; height: 176px; }
.hero-book { position: absolute; top: 50px; left: 50%; width: 132px; height: 150px; border-radius: 11px 15px 12px 8px; background: #70aa7b; box-shadow: 7px 11px 18px rgb(45 100 58 / 16%); transform: translateX(-44%) rotate(-5deg); }
.book-top { position: absolute; inset: 0 8px 12px 0; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; border-radius: 10px 13px 7px 7px; color: #fff; background: #6da376; }
.book-top::after { position: absolute; inset: 9px; border: 1px solid rgb(255 255 255 / 36%); border-radius: 6px; content: ""; }
.book-top span { z-index: 1; font-family: var(--serif); font-size: 27.6px; font-weight: 800; letter-spacing: -1.4px; }
.book-top small { z-index: 1; margin-top: 1px; font-size: 9.6px; letter-spacing: 1.8px; text-transform: uppercase; }
.book-top i { z-index: 1; margin-top: 12px; font-size: 15.6px; font-style: normal; }
.book-pages { position: absolute; right: 4px; bottom: 3px; left: 7px; height: 8px; border-radius: 0 0 5px 4px; background: repeating-linear-gradient(0deg, #f7f1dc, #f7f1dc 1px, #e4dfd0 2px, #e4dfd0 3px); }
.hero-pencil { position: absolute; top: 66px; left: calc(50% + 72px); width: 9px; height: 135px; border-radius: 5px; background: #e6bd69; box-shadow: inset 2px 0 #f0d28c; transform: rotate(18deg); }
.hero-pencil::before { position: absolute; top: -9px; left: 0; width: 0; height: 0; border-right: 4.5px solid transparent; border-bottom: 10px solid #b58b53; border-left: 4.5px solid transparent; content: ""; }
.hero-pencil::after { position: absolute; bottom: -9px; left: 0; width: 9px; height: 10px; border-radius: 1px 1px 5px 5px; background: #e8a0a0; content: ""; }
.hero-badge { position: absolute; top: 37px; right: 10px; padding: 8px 11px; border: 1px solid #e5ece1; border-radius: 20px; color: #67876b; background: #fbfcf6; box-shadow: 0 5px 14px rgb(50 83 54 / 7%); font-size: 10.8px; font-weight: 700; transform: rotate(4deg); }
.hero-spark { position: absolute; color: #82ad75; }
.spark-a { top: 69px; left: 13%; font-size: 26.4px; }
.spark-b { right: 3%; bottom: 56px; color: #e0bd70; font-size: 22.8px; }
.hero-plant { position: absolute; bottom: 36px; left: 16%; width: 41px; height: 37px; }
.hero-plant > span { position: absolute; bottom: 13px; left: 19px; width: 13px; height: 23px; border-radius: 100% 0 100% 0; background: #80a776; transform-origin: bottom left; }
.hero-plant > span:nth-child(1) { transform: rotate(-52deg); }
.hero-plant > span:nth-child(2) { transform: rotate(14deg); }
.hero-plant > span:nth-child(3) { left: 9px; height: 17px; transform: rotate(-83deg); }
.hero-plant i { position: absolute; bottom: 0; left: 11px; width: 27px; height: 17px; border-radius: 3px 3px 9px 9px; background: #d29773; }
.hero-plant b { position: absolute; bottom: 14px; left: 8px; width: 32px; height: 5px; border-radius: 4px; background: #bd805e; }
.hero-decor { position: absolute; border-radius: 50%; background: rgb(255 255 255 / 18%); }
.hero-decor-one { top: -60px; right: 30%; width: 170px; height: 170px; }
.hero-decor-two { right: -20px; bottom: -75px; width: 220px; height: 220px; }
.access-screen { display: grid; min-height: 100vh; place-items: center; padding: 28px 18px; }
.access-card {
  display: flex; width: min(100%, 420px); flex-direction: column; align-items: stretch;
  padding: 30px; border: 1px solid #f0dce3; border-radius: 20px; background: rgb(255 255 255 / 94%);
  box-shadow: 0 18px 55px rgb(91 57 70 / 10%);
}
.access-brand { align-self: center; margin: 0 0 20px; }
.access-illustration {
  display: grid; place-items: center; width: 52px; height: 52px; align-self: center;
  margin-bottom: 17px; border: 1px solid; border-radius: 16px; font-size: 27.6px;
}
.access-card > .section-kicker { text-align: center; }
.access-card > h1 { margin: 8px 0 7px; color: #704356; font-family: var(--serif); font-size: 32.4px; font-weight: 800; letter-spacing: -.7px; text-align: center; }
.access-card > p { margin: 0 0 22px; color: #89948b; font-size: 14.4px; line-height: 1.6; text-align: center; }
.access-label { margin-bottom: 7px; color: #647267; font-size: 12px; font-weight: 800; letter-spacing: .8px; }
.access-input { width: 100%; height: 43px; padding: 0 12px; border: 1px solid #e8dce1; border-radius: 9px; color: #3f5145; background: #fff; font-size: 14.4px; }
.access-input:focus { border-color: #d87594; outline: 3px solid rgb(216 117 148 / 15%); }
.access-error { margin-top: 8px; color: #a65e54; font-size: 12px; line-height: 1.5; }
.access-submit { width: 100%; justify-content: space-between; margin-top: 14px; }
.access-submit:disabled { cursor: not-allowed; opacity: .55; }
.access-footnote { margin-top: 17px; color: #9a8c92; font-size: 12px; text-align: center; }
.access-footnote span { margin-left: 3px; color: #d87594; }
.modal-backdrop { position: fixed; inset: 0; z-index: 15; display: grid; place-items: center; padding: 20px; background: rgb(26 41 32 / 48%); backdrop-filter: blur(4px); animation: fade-in .18s ease; }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
.quiz-modal { display: flex; flex-direction: column; width: min(620px, 100%); min-height: 510px; max-height: calc(100vh - 40px); overflow: auto; border-radius: 18px; background: #fff; box-shadow: 0 20px 70px rgb(18 37 24 / 20%); }
.quiz-top { display: flex; align-items: center; justify-content: space-between; padding: 18px 23px; border-bottom: 1px solid #eff1ed; }
.quiz-brand { color: #607067; font-family: var(--serif); font-size: 14.4px; font-weight: 800; }
.quiz-brand span { margin-right: 5px; color: #5b9a6e; }
.modal-close { display: grid; place-items: center; width: 31px; height: 31px; border: 0; border-radius: 8px; color: #879188; background: #f6f8f5; }
.quiz-progress-heading { display: flex; justify-content: space-between; padding: 20px 27px 8px; color: #879388; font-size: 12px; }
.quiz-progress-track { height: 4px; margin: 0 27px; overflow: hidden; border-radius: 3px; background: #edf1ec; }
.quiz-progress-track span { display: block; height: 100%; border-radius: inherit; background: #69a77a; transition: width .3s; }
.quiz-content { width: min(480px, calc(100% - 54px)); margin: 28px auto 30px; }
.quiz-lesson-icon { display: grid; place-items: center; width: 39px; height: 39px; margin-bottom: 15px; border-radius: 11px; background: #eff6ec; font-size: 24px; }
.quiz-content h1 { margin-bottom: 20px; color: #2d3c32; font-family: var(--serif); font-size: 25.2px; font-weight: 800; line-height: 1.45; letter-spacing: -.5px; }
.answer-options { display: grid; gap: 9px; }
.answer-option { display: flex; align-items: center; gap: 11px; min-height: 49px; padding: 8px 12px; border: 1px solid #e9eee8; border-radius: 9px; color: #5f6b61; background: #fff; text-align: left; font-size: 13.2px; line-height: 1.5; transition: .15s; }
.answer-option:hover { border-color: #b6d1b7; background: #fafdf9; }
.answer-option.selected { border-color: #69a87a; color: #3e704e; background: #f2f8f0; box-shadow: inset 0 0 0 1px #69a87a; }
.answer-option:disabled { cursor: default; }
.answer-option.answer-correct { border-color: #76b184; color: #3c744c; background: #f0f8ef; }
.answer-option.answer-correct .option-letter { border-color: #c8e0c9; color: #fff; background: #62a476; }
.answer-option.answer-incorrect { border-color: #dfa39d; color: #92574e; background: #fff6f4; }
.answer-option.answer-incorrect .option-letter { border-color: #efd2ce; color: #a76056; background: #f8e5e2; }
.answer-feedback { display: grid; gap: 4px; margin-top: 12px; padding: 11px 13px; border-radius: 8px; font-size: 12px; line-height: 1.5; }
.answer-feedback strong { font-size: 13.2px; }
.answer-feedback span { color: #6d7c70; }
.feedback-correct { color: #477854; background: #eff7ed; }
.feedback-incorrect { color: #9c6258; background: #fff5f1; }
.option-letter { display: grid; place-items: center; flex: 0 0 auto; width: 23px; height: 23px; border: 1px solid #e7ebe5; border-radius: 7px; color: #89948a; background: #fafbf9; font-size: 12px; font-weight: 700; }
.selected .option-letter { border-color: #c5dfc7; color: #508361; background: #e5f2e4; }
.quiz-footer { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: auto; padding: 15px 27px; border-top: 1px solid #eff1ed; }
.quiz-encourage { color: #96a096; font-size: 12px; }
.quiz-footer .button:disabled { cursor: not-allowed; background: #afc9b2; }
.quiz-error { margin-top: 12px; color: #af574d; font-size: 13.2px; }
.quiz-result { display: grid; justify-items: center; align-content: center; flex: 1; padding: 36px; text-align: center; }
.result-art { margin-bottom: 14px; font-size: 57.6px; }
.quiz-result h2 { margin: 8px 0; color: #2d3c32; font-family: var(--serif); font-size: 30px; letter-spacing: -.7px; }
.quiz-result p { max-width: 335px; margin: 0 0 16px; color: #829086; font-size: 14.4px; line-height: 1.7; }
.quiz-result p strong { color: #4d6e55; }
.earned-xp { margin-bottom: 19px; padding: 9px 14px; border-radius: 20px; color: #9d8133; background: #fbf5df; font-size: 14.4px; font-weight: 800; }
.toast { position: fixed; right: 24px; bottom: 24px; z-index: 20; display: flex; align-items: center; gap: 15px; max-width: min(380px, calc(100% - 32px)); padding: 12px 14px; border: 1px solid #e4ebe2; border-radius: 10px; color: #57665b; background: #fff; box-shadow: 0 7px 24px rgb(29 51 34 / 11%); font-size: 13.2px; }
.toast button { display: grid; place-items: center; padding: 3px; border: 0; color: #89958a; background: transparent; }
.flashcard-modal { display: flex; flex-direction: column; width: min(620px, 100%); min-height: 545px; max-height: calc(100vh - 40px); overflow: auto; border-radius: 18px; background: #fff; box-shadow: 0 20px 70px rgb(18 37 24 / 20%); }
.flashcard-heading { padding: 22px 28px 13px; }
.flashcard-heading h1 { margin: 7px 0 5px; color: #2d3c32; font-family: var(--serif); font-size: 26.4px; font-weight: 800; letter-spacing: -.7px; }
.flashcard-heading p { margin: 0; color: #879287; font-size: 13.2px; }
.flashcard-toolbar { display: flex; align-items: center; gap: 9px; padding: 0 28px 13px; }
.flashcard-toolbar label { color: #8b968b; font-size: 12px; font-weight: 600; }
.flashcard-toolbar select { max-width: 190px; padding: 7px 25px 7px 9px; border: 1px solid #e7ece5; border-radius: 7px; color: #526357; background: #fff; font-size: 12px; }
.flashcard-count { margin-left: auto; color: #829084; font-size: 10.8px; }
.flashcard { position: relative; display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: center; min-height: 265px; margin: 0 28px; padding: 36px 40px 31px; border: 1px solid #dcebdd; border-radius: 15px; color: #314538; background: radial-gradient(ellipse at 90% 10%, #edf6e9 0, transparent 35%), linear-gradient(145deg, #f7fbf5, #f0f7ee); text-align: center; transition: background .2s, border .2s; }
.flashcard:hover { border-color: #b7d3b8; background: #f1f8ef; }
.flashcard.is-flipped { border-color: #d9e8d8; background: radial-gradient(ellipse at 10% 90%, #e6f2e4 0, transparent 38%), linear-gradient(145deg, #f8fbf7, #f1f7f1); }
.flashcard-card-top { position: absolute; top: 15px; right: 17px; left: 17px; display: flex; justify-content: space-between; color: #829783; font-size: 10.8px; font-weight: 700; }
.flashcard-face { margin-bottom: 13px; color: #77a17b; font-size: 10.8px; font-weight: 800; letter-spacing: 1.4px; }
.flashcard-main { max-width: 420px; color: #314538; font-family: var(--serif); font-size: 22.8px; font-weight: 700; line-height: 1.55; }
.is-flipped .flashcard-main { font-family: "DM Sans", sans-serif; font-size: 16.8px; font-weight: 500; line-height: 1.75; }
.flashcard-hint { max-width: 390px; margin-top: 14px; color: #879588; font-size: 12px; line-height: 1.5; }
.flashcard-source { max-width: 390px; margin-top: 12px; color: #9aa79a; font-size: 10.8px; }
.flashcard-flip-label { position: absolute; bottom: 13px; color: #91a192; font-size: 10.8px; }
.flashcard-controls { display: flex; align-items: center; justify-content: center; gap: 17px; padding: 15px 28px 7px; }
.flashcard-nav { display: grid; place-items: center; width: 36px; height: 36px; border: 1px solid #e7ece5; border-radius: 10px; color: #65836a; background: #fff; font-size: 21.6px; }
.flashcard-nav:hover { border-color: #b8d1b8; background: #f5faf3; }
.flashcard-controls .button:disabled { cursor: not-allowed; opacity: .55; }
.button-remembered { color: #4e815b; background: #e8f3e7; }
.button-remembered:hover { background: #dceede; }
.flashcard-disclaimer { padding: 0 20px 15px; color: #a0a89e; text-align: center; font-size: 10.8px; }
.flashcard-message { display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: center; gap: 12px; min-height: 280px; color: #7d897e; font-size: 14.4px; }
.flashcard-error { color: #a65e54; }`;

const GLOBAL_OVERRIDE_STYLES = String.raw`@media (min-width: 1400px) {
  .page-content { padding-top: 40px; }
  .hero-card { min-height: 275px; }
  .hero-book { top: 58px; }
}
@media (max-width: 1100px) {
  .sidebar { width: 213px; padding-right: 15px; padding-left: 15px; }
  .main-content { margin-left: 213px; }
  .topbar { padding: 0 29px; }
  .page-content { padding-right: 29px; padding-left: 29px; }
  .lesson-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .study-path-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .lesson-card { min-height: 173px; }
  .bottom-grid { grid-template-columns: minmax(0, 1.35fr) minmax(220px, .9fr); }
  .progress-ring-wrap { right: 10px; transform: scale(.83); transform-origin: top right; }
}
@media (max-width: 760px) {
  .sidebar { position: fixed; inset: auto 0 0; z-index: 8; display: block; width: 100%; height: 62px; padding: 5px 10px calc(5px + env(safe-area-inset-bottom)); border-top: 1px solid #e9ede7; border-right: 0; background: #fff; }
  .brand, .nav-label, .sidebar-bottom { display: none; }
  .main-nav { display: flex; justify-content: space-around; height: 100%; gap: 3px; }
  .nav-item { display: flex; flex-direction: column; justify-content: center; gap: 3px; width: 20%; height: 51px; padding: 3px; border-radius: 9px; font-size: 9.6px; }
  .nav-item svg { width: 18px; height: 18px; }
  .nav-count { position: absolute; transform: translate(15px, -10px); min-width: 15px; width: 15px; height: 15px; font-size: 9.6px; }
  .main-content { margin-left: 0; padding-bottom: 63px; }
  .topbar { height: 54px; padding: 0 18px; }
  .topbar-right { gap: 13px; }
  .top-stat { gap: 4px; font-size: 12px; }
  .top-stat > span:last-child { display: none; }
  .top-avatar { width: 28px; height: 28px; }
  .page-content { padding: 25px 18px 19px; }
  .welcome-row { align-items: start; gap: 10px; }
  .welcome-row h1 { font-size: 28.8px; }
  .welcome-subtitle { max-width: 240px; font-size: 12px; line-height: 1.5; }
  .weekly-pill { gap: 5px; padding: 8px; font-size: 0; white-space: nowrap; }
  .weekly-pill strong { font-size: 12px; }
  .weekly-icon { font-size: 18px; }
  .weekly-arrow { display: none; }
  .hero-card { min-height: 255px; padding: 24px 20px; }
  .hero-copy { width: 68%; }
  .hero-card h2 { font-size: 32.4px; }
  .hero-card p { max-width: 210px; font-size: 12px; line-height: 1.5; }
  .hero-progress-label, .hero-progress-track { width: min(230px, 100%); }
  .hero-illustration { right: -10%; width: 50%; opacity: .72; }
  .hero-book { top: 63px; width: 98px; height: 125px; }
  .book-top span { font-size: 22.8px; }
  .hero-pencil { top: 76px; left: calc(50% + 56px); height: 110px; }
  .hero-badge { top: 30px; right: 1px; font-size: 9.6px; }
  .hero-plant { left: 7%; transform: scale(.8); }
  .lesson-section { margin-top: 26px; }
  .section-heading h2 { font-size: 20.4px; }
  .section-heading p { max-width: 225px; font-size: 10.8px; line-height: 1.5; }
  .text-button { gap: 3px; font-size: 10.8px; white-space: nowrap; }
  .lesson-grid { gap: 9px; }
  .lesson-card { min-height: 180px; padding: 12px 11px 10px; }
  .study-path-grid { gap: 9px; }
  .study-path-card { min-height: 198px; padding: 11px; }
  .study-path-card h3 { font-size: 13.2px; }
  .study-path-card > p { font-size: 9.6px; }
  .study-path-status { font-size: 7.2px; letter-spacing: .3px; }
  .path-progress-pill { padding: 6px 8px; font-size: 9.6px; }
  .lesson-card h3 { font-size: 13.2px; }
  .lesson-card > p { font-size: 9.6px; }
  .lesson-status { font-size: 7.2px; letter-spacing: .3px; }
  .bottom-grid { grid-template-columns: 1fr; }
  .progress-card { min-height: 190px; }
  .progress-ring-wrap { top: 33px; right: 22px; transform: scale(.85); }
  .progress-stats { margin-top: 24px; }
  .study-backdrop { padding: 0; }
  .study-room { width: 100%; height: 100dvh; max-height: 100dvh; border: 0; border-radius: 0; }
  .study-room-header { min-height: 61px; gap: 9px; padding: 8px 12px; }
  .study-brand { gap: 6px; }
  .study-brand .brand-name { font-size: 16.8px; }
  .study-brand .brand-mark { width: 27px; height: 27px; font-size: 20.4px; }
  .study-room-title-block { padding-left: 9px; }
  .study-room-title-block .section-kicker { font-size: 8.4px; letter-spacing: .7px; }
  .study-room-title-block h1 { font-size: 15.6px; }
  .study-read-count { font-size: 9.6px; }
  .study-room-body { display: flex; flex-direction: column; }
  .study-unit-list { display: flex; flex: 0 0 auto; flex-direction: row; gap: 6px; overflow-x: auto; overflow-y: hidden; padding: 8px 10px; border-right: 0; border-bottom: 1px solid #edf0eb; }
  .study-unit-label { display: none; }
  .study-unit-button { flex: 0 0 auto; min-height: 38px; gap: 6px; padding: 5px 8px; border-color: #edf0eb; background: #fff; }
  .study-unit-copy { max-width: 130px; }
  .study-unit-copy strong { font-size: 10.8px; }
  .study-unit-copy small { font-size: 8.4px; }
  .study-unit-done { width: 14px; height: 14px; font-size: 9.6px; }
  .study-sidebar-note { display: none; }
  .study-article-inner { padding: 19px 18px 22px; }
  .study-article-inner > h2 { font-size: 26.4px; }
  .study-introduction { font-size: 13.2px; }
  .study-objectives { margin-top: 15px; padding: 12px 13px; }
  .study-objectives li, .study-section li, .study-section > p { font-size: 12px; }
  .study-sections { gap: 15px; margin-top: 18px; }
  .study-article-footer { flex-wrap: wrap; justify-content: space-between; gap: 4px; padding: 9px 10px; }
  .study-practice-actions { order: 3; width: 100%; justify-content: center; gap: 18px; }
  .study-step-button, .study-quiz-button, .study-flashcard-button, .study-save-button { font-size: 9.6px; }
  .study-practice-actions { gap: 9px; }
  .study-save-message { text-align: center; }
  .study-quiz-button { order: 0; }
  .study-flashcard-button { order: 1; }
  .study-step-button { order: 1; }
  .study-article-footer .button { gap: 5px; min-height: 32px; padding: 0 8px; font-size: 9.6px; }
}
@media (max-width: 420px) {
  .topbar { padding: 0 13px; }
  .breadcrumb { font-size: 12px; }
  .topbar-right { gap: 9px; }
  .page-content { padding-right: 13px; padding-left: 13px; }
  .welcome-row h1 { font-size: 25.2px; }
  .weekly-pill { padding: 7px 6px; }
  .hero-card { padding-left: 16px; }
  .hero-card h2 { font-size: 28.8px; }
  .hero-card p { max-width: 180px; }
  .hero-illustration { right: -19%; }
  .button-white { gap: 8px; padding: 0 10px; font-size: 12px; }
  .lesson-card { padding-right: 9px; padding-left: 9px; }
  .lesson-topline { gap: 3px; }
  .lesson-icon { width: 29px; height: 29px; font-size: 18px; }
  .study-path-grid { grid-template-columns: 1fr; }
  .study-path-card { min-height: 178px; }
  .todo-card, .progress-card { padding-right: 13px; padding-left: 13px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
:root {
  --ink: #263b31;
  --green: #4f9c71;
  --green-dark: #34754e;
  --pink: #d87594;
  --pink-dark: #a94f6c;
  --pink-soft: #fff0f4;
}

body { background: #faf8f7; }
.sidebar { border-right-color: #f0e8e9; }
.brand-mark { color: var(--green-dark); background: #e7f4e9; }
.brand-mark span { color: var(--pink); }
.brand-name span { color: var(--green); }
.nav-item:hover { background: #fff5f7; }
.nav-item.active { color: var(--pink-dark); background: var(--pink-soft); }
.nav-count { color: var(--pink-dark); background: #fce2e9; }
.sidebar-note { border-color: #f3e5e9; background: #fff9fa; }
.note-spark { color: var(--pink-dark); background: #fce8ed; }
.avatar, .top-avatar { color: var(--green-dark); background: #e8f3e5; }
.topbar { border-bottom-color: #f0e8e9; background: rgb(250 248 247 / 94%); }
.hero-card { background: linear-gradient(115deg, #e4f2e5 0%, #e8f3e9 63%, #fceaf0 100%); }
.hero-kicker { color: #63866b; }
.hero-kicker-dot { background: var(--pink); }
.hero-card h2 span { color: var(--pink-dark); }
.hero-progress-track { background: #d2e3d3; }
.hero-progress-track span { background: linear-gradient(90deg, var(--green), var(--pink)); }
.orbit { border-color: rgb(216 117 148 / 18%); }
.hero-book { background: #d87594; box-shadow: 7px 11px 18px rgb(141 70 94 / 18%); }
.book-top { background: linear-gradient(145deg, #dc829d, #bb6481); }
.hero-badge { border-color: #f4d8e1; color: #a94f6c; background: #fff7f9; }
.lesson-icon.lavender { background: #fbeaf0; }
.lesson-icon.peach { background: #e6f3e9; }
.study-path-card.is-next { border-color: #bcd9c0; }
.study-path-card:nth-child(even):not(.is-next) { border-color: #f1e3e7; background: #fffafb; }
.study-path-card:nth-child(even) .study-path-number { color: var(--pink-dark); background: #fbe8ee; }
.study-path-card:nth-child(even) .study-path-action { color: var(--pink-dark); background: #fceaf0; }
.study-path-card:nth-child(even) .study-path-action:hover { color: #8f3e5a; background: #f8dce5; }
.path-progress-pill { border-color: #f1dce3; color: var(--pink-dark); background: #fff3f6; }
.study-path-action { color: var(--green-dark); background: #eaf5e9; }
.study-path-action:hover { color: #285f3f; background: #dff0de; }
.todo-total { color: var(--pink-dark); background: #fce8ee; }
.task-check:hover { border-color: var(--pink); }
.task-check.checked { border-color: var(--green); background: var(--green); }
.summary-check { background: var(--green); }
.add-task-button { border-color: #f1dfe5; color: var(--pink-dark); }
.add-task-button:hover { background: #fff4f7; }
.task-form-fields > button[type="submit"] { background: var(--green); }
.progress-ring { stroke: var(--pink); }
.ring-leaf { color: var(--pink-dark); background: #fce8ee; }
.loader { border-color: #f5e3e9; border-top-color: var(--pink); }
.access-screen { background: radial-gradient(ellipse at 18% 14%, #e2f1e2 0, transparent 36%), radial-gradient(ellipse at 90% 88%, #f8e5eb 0, transparent 38%), #f7f8f4; }
.access-illustration { border-color: #f0d8e0; background: #fff0f4; }
.button-primary { background: var(--green); }
.button-primary:hover { background: var(--green-dark); }
.study-unit-button:hover { background: #fff4f7; }
.study-unit-button.selected { border-color: #f1d6df; color: var(--pink-dark); background: #fff0f4; }
.study-unit-number { color: var(--green); }
.study-unit-done { background: var(--green); }
.study-objectives { border-color: #dcebdd; background: #f3f8f1; }
.study-objectives h3 { color: var(--green-dark); }
.study-reflection { border-left-color: var(--pink); background: #fff1f5; }
.study-reflection > span { color: var(--pink-dark); }
.study-reflection p { color: #684452; }
.study-safety-note { border-color: #dcebdd; background: #f5faf3; }
.study-safety-note strong { color: var(--green-dark); }
.study-safety-note span { color: #617365; }
.study-step-button, .study-flashcard-button { color: var(--pink-dark); }
.study-step-button:hover, .study-flashcard-button:hover { color: #833b55; }
.flashcard { border-color: #e8d6de; background: radial-gradient(ellipse at 90% 10%, #fce8ee 0, transparent 36%), linear-gradient(145deg, #f5faf3, #fff2f6); }
.flashcard:hover { border-color: #e5b5c5; background: #fff3f6; }
.flashcard.is-flipped { border-color: #dcebdd; background: radial-gradient(ellipse at 10% 90%, #e6f2e4 0, transparent 38%), linear-gradient(145deg, #fff7f9, #f0f7ef); }
.flashcard-face { color: var(--pink-dark); }
.flashcard-nav:hover { border-color: #e5b5c5; background: #fff3f6; }
.button-remembered { color: var(--green-dark); background: #e8f3e7; }
.button-remembered:hover { background: #dceede; }
.answer-option.selected { border-color: var(--pink); color: var(--pink-dark); background: #fff2f6; box-shadow: inset 0 0 0 1px var(--pink); }
.answer-option.answer-correct .option-letter { background: var(--green); }
.selected .option-letter { border-color: #f1cad6; color: var(--pink-dark); background: #fce8ee; }
.feedback-correct { color: var(--green-dark); background: #eff7ed; }
.todo-card {
  border-color: #f0dce3;
  background: #fff;
  box-shadow: 0 8px 24px rgb(180 84 117 / 5%);
}
.todo-card .section-kicker { color: #a27484; }
.todo-card .todo-header h2 { color: #704356; }
.todo-card .todo-total { color: #a94f6c; background: #fce8ee; }
.todo-card .task-row { border-bottom-color: #f1e7ea; }
.todo-card .task-check { border-color: #e7d5dc; background: #fffafb; }
.todo-card .task-check.checked { border-color: #4f9c71; color: #fff; background: #4f9c71; }
.todo-card .task-delete:hover { color: #a94f6c; background: #fce8ee; }
.todo-card .summary-check { background: #4f9c71; }
.todo-card .add-task-button { border-color: #f1dfe5; color: #a94f6c; background: #fff; }
.todo-card .add-task-button:hover { background: #fff4f7; }
.todo-card .task-form-fields > button[type="submit"] { background: #4f9c71; }
.progress-card {
  border-color: #f0d4de;
  background: linear-gradient(145deg, #fff6f8, #fbeaf0);
  box-shadow: 0 8px 24px rgb(180 84 117 / 7%);
}
.progress-card .section-kicker { color: #a94f6c; }
.progress-card h2 { color: #704356; }
.progress-card > p { color: #987b87; }
.progress-ring circle:first-child { stroke: #f2d6df; }
.progress-ring circle:nth-child(2) { stroke: #d87594; }
.ring-text strong { color: #a94f6c; }
.ring-leaf { color: #a94f6c; background: #f8dce5; }
.progress-stats strong { color: #704356; }
.progress-stats .streak-mini { color: #a94f6c; background: #f8dce5; }
.progress-stats .xp-mini { color: #a94f6c; background: #fce8ee; }
@media (max-width: 1100px) {
  .review-stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 760px) {
  .main-nav { justify-content: flex-start; overflow-x: auto; }
  .nav-item { flex: 0 0 auto; width: 68px; }
  .overview-date-pill { display: none; }
  .overview-welcome h1 { font-size: 27.6px; }
  .review-stats-grid { gap: 8px; }
  .review-stat-card { min-height: 139px; padding: 12px; }
  .overview-review-card { padding: 14px; }
  .overview-unit-list { grid-template-columns: 1fr; }
  .single-panel-grid .progress-ring-wrap { right: 13px; }
  .single-panel-grid .progress-review-count { right: 15px; bottom: 19px; max-width: 130px; text-align: right; }
  .notepad-workspace { grid-template-columns: minmax(145px, 190px) minmax(0, 1fr); min-height: 430px; }
  .note-editor { min-height: 430px; padding: 13px; }
  .note-content-input { min-height: 280px; }
}
@media (max-width: 520px) {
  .notepad-workspace { grid-template-columns: 1fr; }
  .notes-list-panel { border-right: 0; border-bottom: 1px solid #f1e7ea; }
  .notes-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .note-editor { min-height: 360px; }
  .note-content-input { min-height: 220px; }
}
@media (max-width: 420px) {
  .page-title-row h1 { font-size: 27.6px; }
  .review-stat-label { font-size: 8.4px; letter-spacing: .45px; }
  .review-stat-note { font-size: 9.6px; }
  .overview-unit-status { font-size: 8.4px; }
  .single-panel-grid .progress-stats { gap: 12px; }
}
.sidebar { border-right-color: #f0d8e0; background: #fff4f7; }
.sidebar .nav-item { color: #7b6570; }
.sidebar .nav-item:hover { color: #704356; background: #fce9ef; }
.sidebar .nav-item.active { color: #a94f6c; background: #f8dce5; }
.sidebar .sidebar-note { border-color: #f0d8e0; background: #fffafb; }
.sidebar .profile { border-top-color: #f0d8e0; background: transparent; }
:root {
  --glass-border: rgb(255 255 255 / 74%);
  --glass-surface: rgb(255 255 255 / 67%);
  --glass-shadow: 0 14px 36px rgb(94 75 88 / 9%);
}
body {
  background: radial-gradient(ellipse at 8% 8%, rgb(200 230 204 / 58%), transparent 34%), radial-gradient(ellipse at 91% 23%, rgb(249 211 224 / 48%), transparent 34%), radial-gradient(ellipse at 75% 91%, rgb(213 232 218 / 46%), transparent 36%), #f7f7f5;
  background-attachment: fixed;
}
.sidebar { border-right-color: rgb(255 255 255 / 75%); background: rgb(255 249 251 / 72%); box-shadow: 8px 0 30px rgb(112 89 101 / 5%); backdrop-filter: blur(22px) saturate(145%); -webkit-backdrop-filter: blur(22px) saturate(145%); }
.topbar { border-bottom-color: rgb(255 255 255 / 75%); background: rgb(250 249 248 / 68%); backdrop-filter: blur(18px) saturate(145%); -webkit-backdrop-filter: blur(18px) saturate(145%); }
.sidebar-note, .weekly-pill, .lesson-card, .study-path-card, .todo-card, .progress-card, .review-stat-card, .overview-review-card, .notepad-workspace, .pdf-text-workspace, .access-card, .quiz-modal, .flashcard-modal, .study-room, .toast { border-color: var(--glass-border); box-shadow: var(--glass-shadow); backdrop-filter: blur(18px) saturate(145%); -webkit-backdrop-filter: blur(18px) saturate(145%); }
.sidebar-note { background: rgb(255 255 255 / 48%); }
.weekly-pill, .lesson-card, .study-path-card, .todo-card, .overview-review-card, .notepad-workspace, .pdf-text-workspace, .access-card, .quiz-modal, .flashcard-modal, .study-room, .toast { background: var(--glass-surface); }
.hero-card { border: 1px solid rgb(255 255 255 / 70%); background: linear-gradient(115deg, rgb(224 242 226 / 76%), rgb(230 243 232 / 66%) 63%, rgb(252 230 238 / 72%)); box-shadow: var(--glass-shadow); backdrop-filter: blur(16px) saturate(145%); -webkit-backdrop-filter: blur(16px) saturate(145%); }
.study-path-card.is-next, .study-path-card.is-reviewed, .study-path-card:nth-child(even):not(.is-next) { background: rgb(255 255 255 / 61%); }
.progress-card { background: linear-gradient(145deg, rgb(255 247 249 / 78%), rgb(250 231 238 / 68%)); }
.review-stat-green { background: linear-gradient(145deg, rgb(246 251 244 / 76%), rgb(234 245 232 / 67%)); }
.review-stat-pink { background: linear-gradient(145deg, rgb(255 248 250 / 78%), rgb(251 237 241 / 68%)); }
.notes-list-panel, .study-unit-list { background: rgb(255 250 252 / 49%); backdrop-filter: blur(14px) saturate(135%); -webkit-backdrop-filter: blur(14px) saturate(135%); }
.study-article-footer { background: rgb(255 255 255 / 62%); backdrop-filter: blur(14px) saturate(135%); -webkit-backdrop-filter: blur(14px) saturate(135%); }
.answer-option, .flashcard-nav, .flashcard-toolbar select, .study-objectives, .study-safety-note { background-color: rgb(255 255 255 / 57%); backdrop-filter: blur(12px) saturate(135%); -webkit-backdrop-filter: blur(12px) saturate(135%); }
.flashcard { border-color: rgb(255 255 255 / 76%); background: radial-gradient(ellipse at 90% 10%, rgb(252 232 238 / 76%) 0, transparent 36%), linear-gradient(145deg, rgb(245 250 243 / 78%), rgb(255 242 246 / 74%)); box-shadow: inset 0 1px 0 rgb(255 255 255 / 74%), 0 10px 24px rgb(112 89 101 / 7%); backdrop-filter: blur(14px) saturate(140%); -webkit-backdrop-filter: blur(14px) saturate(140%); }
.flashcard.is-flipped { background: radial-gradient(ellipse at 10% 90%, rgb(230 242 228 / 78%) 0, transparent 38%), linear-gradient(145deg, rgb(255 247 249 / 78%), rgb(240 247 239 / 76%)); }
.pdf-upload-card { border-color: rgb(255 255 255 / 78%); background: rgb(255 255 255 / 40%); box-shadow: inset 0 1px 0 rgb(255 255 255 / 66%); border-style: dashed; }
.task-form-fields > input, .task-deadline-field input { background: rgb(255 255 255 / 70%); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
.access-screen { background: radial-gradient(ellipse at 18% 14%, rgb(226 241 226 / 70%) 0, transparent 36%), radial-gradient(ellipse at 90% 88%, rgb(248 229 235 / 68%) 0, transparent 38%), rgb(247 248 244 / 70%); }
@media (max-width: 760px) { .sidebar { border-top-color: rgb(255 255 255 / 75%); background: rgb(255 249 251 / 78%); } }
@media (prefers-reduced-transparency: reduce) {
  .sidebar, .topbar, .sidebar-note, .weekly-pill, .lesson-card, .study-path-card, .todo-card, .progress-card, .review-stat-card, .overview-review-card, .notepad-workspace, .pdf-text-workspace, .access-card, .quiz-modal, .flashcard-modal, .study-room, .toast, .notes-list-panel, .study-unit-list, .study-article-footer, .answer-option, .flashcard-nav, .flashcard-toolbar select, .study-objectives, .study-safety-note { backdrop-filter: none; -webkit-backdrop-filter: none; }
}`;

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <style>{GLOBAL_BASE_STYLES}</style>
    <App />
    <style>{GLOBAL_OVERRIDE_STYLES}</style>
  </React.StrictMode>,
);
