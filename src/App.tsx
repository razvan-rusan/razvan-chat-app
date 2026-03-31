import {convertFileSrc} from "@tauri-apps/api/core";

import {resourceDir, join, resolveResource} from "@tauri-apps/api/path";
import {useEffect, useState} from "react";
import "./App.css";

function Demo() {
    const [active, setActive] = useState(1);
    const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    return (
        <>

        </>
    );
}

export default function App() {

  return (

          <Demo />
  );
}
