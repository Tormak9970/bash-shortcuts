import { Field, PanelSection, PanelSectionRow, TextField, ButtonItem, quickAccessControlsClasses, ToggleField } from "decky-frontend-lib"
import { Fragment, useState, useEffect } from "react"
import { PyInterop } from "../../PyInterop";
import { Shortcut } from "../../lib/data-structures/Shortcut";

import {v4 as uuidv4} from "uuid";
import { useShortcutsState } from "../../state/ShortcutsState";

export function AddShortcut() {
	const {shortcuts, setShortcuts, shortcutsList} = useShortcutsState();
	const [ableToSave, setAbleToSave] = useState(false);
	const [name, setName] = useState<string>("");
	const [cmd, setCmd] = useState<string>("");
    const [isApp, setIsApp] = useState<boolean>(true);

	function saveShortcut() {
		const newShort = new Shortcut(uuidv4(), name, cmd, shortcutsList.length+1, isApp);
		PyInterop.addShortcut(newShort);
		setName("");
		setCmd("");
		PyInterop.toast("Success", "Shortcut Saved!");

		const ref = {...shortcuts};
		ref[newShort.id]= newShort;
		setShortcuts(ref);
	}

	useEffect(() => {
		setAbleToSave(name != "" && cmd != "");
	}, [name, cmd])

	return (
		<>
			<style>{`
            .scoper .${quickAccessControlsClasses.PanelSection} {
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
									onChange={(e) => {setName(e?.target.value)}}
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
									onChange={(e) => {setCmd(e?.target.value)}}
								/>}
						/>
					</PanelSectionRow>
                    <PanelSectionRow>
                        <ToggleField label="Does this launch an app?" onChange={(e) => {setIsApp(e)}} checked />
                    </PanelSectionRow>
					<PanelSectionRow>
						{/* @ts-ignore */}
						<ButtonItem layout="below" onClick={saveShortcut} disabled={!ableToSave} bottomSeparator='none'>
							Save
						</ButtonItem>
					</PanelSectionRow>
				</PanelSection>
			</div>
		</>
	);
}