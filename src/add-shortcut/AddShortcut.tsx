import { Field, PanelSection, PanelSectionRow, TextField, ButtonItem } from "decky-frontend-lib"
import { Fragment, useState, useEffect } from "react"
import { PyInterop } from "../PyInterop";
import { Shortcut } from "../Shortcut";

import {v4 as uuidv4} from "uuid";
import { showToast } from "../general/Toast";

export function AddShortcut() {
	const [ableToSave, setAbleToSave] = useState(false);
	const [name, setName] = useState<string>("");
	const [cmd, setCmd] = useState<string>("");

	function saveShortcut() {
		const newShort = new Shortcut(uuidv4(), name, cmd);
		PyInterop.addShortcut(newShort);
		setName("");
		setCmd("");
		showToast("Shortcut Saved!");
	}

	useEffect(() => {
		setAbleToSave(name != "" && cmd != "");
	}, [name, cmd])

	return (
		<>
			<style>{`
            .scoper .quickaccesscontrols_PanelSection_2C0g0 {
                width: inherit;
                height: inherit;
                padding: 0px;
            }
        `}</style>
			<div className="scoper">
				<PanelSection>
					<PanelSectionRow>
						<Field
							label="Shortcut Name"
							description={
								<TextField
									label={'Name'}
									value={name}
									onChange={(e) => setName(e?.target.value)}
								/>}
						/>
					</PanelSectionRow>
					<PanelSectionRow>
						<Field
							label="Shortcut Command"
							description={
								<TextField
									label={'Command'}
									value={cmd}
									onChange={(e) => setCmd(e?.target.value)}
								/>}
						/>
					</PanelSectionRow>
					<PanelSectionRow>
						<ButtonItem layout="below" onClick={saveShortcut} disabled={!ableToSave}>
							Save
						</ButtonItem>
					</PanelSectionRow>
				</PanelSection>
			</div>
		</>
	);
}