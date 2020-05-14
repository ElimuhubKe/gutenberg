/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import {
	Button,
	Card,
	CardBody,
	Spinner,
	SelectControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import CreateMenuPanel from './create-menu-panel';
import MenuEditor from '../menu-editor';

export default function MenusEditor( { blockEditorSettings } ) {
	const { menus, hasLoadedMenus } = useSelect( ( select ) => {
		const { getMenus, hasFinishedResolution } = select( 'core' );
		return {
			menus: getMenus(),
			hasLoadedMenus: hasFinishedResolution( 'getMenus' ),
		};
	}, [] );

	const [ menuId, setMenuId ] = useState();
	const [ stateMenus, setStateMenus ] = useState();

	useEffect( () => {
		if ( menus?.length ) {
			setStateMenus( menus );
			setMenuId( menus[ 0 ].id );
		}
	}, [ menus ] );

	if ( ! hasLoadedMenus ) {
		return <Spinner />;
	}

	const hasMenus = hasLoadedMenus && !! stateMenus?.length;
	const isCreatingFirstMenu = ! hasMenus;
	const isCreatingAdditionalMenu = hasMenus && ! menuId;
	const isCreatingMenu = isCreatingFirstMenu || isCreatingAdditionalMenu;
	const hasSelectedMenu = hasMenus && !! menuId;

	return (
		<>
			<Card className="edit-navigation-menus-editor__menu-selection-card">
				<CardBody className="edit-navigation-menus-editor__menu-selection-card-body">
					{ isCreatingMenu && (
						<p className="edit-navigation-menus-editor__menu-selection-card-instructional-text">
							{ isCreatingFirstMenu
								? __( 'Create your first menu below.' )
								: __( 'Create a new menu below.' ) }
						</p>
					) }
					{ hasSelectedMenu && (
						<>
							<SelectControl
								className="edit-navigation-menus-editor__menu-select-control"
								label={ __( 'Select navigation to edit:' ) }
								options={ stateMenus?.map( ( menu ) => ( {
									value: menu.id,
									label: menu.name,
								} ) ) }
								onChange={ ( selectedMenuId ) =>
									setMenuId( selectedMenuId )
								}
							/>
							<Button isLink onClick={ () => setMenuId() }>
								{ __( 'Create a new menu' ) }
							</Button>
						</>
					) }
				</CardBody>
			</Card>
			{ isCreatingMenu && (
				<CreateMenuPanel
					menus={ stateMenus }
					onCancel={
						// User can only cancel out of menu creation if there
						// are other menus to fall back to showing.
						hasMenus
							? () => setMenuId( stateMenus[ 0 ] )
							: undefined
					}
				/>
			) }
			{ hasSelectedMenu && (
				<MenuEditor
					menuId={ menuId }
					blockEditorSettings={ blockEditorSettings }
					onDeleteMenu={ ( deletedMenu ) => {
						const newStateMenus = stateMenus.filter( ( menu ) => {
							return menu.id !== deletedMenu;
						} );
						setStateMenus( newStateMenus );
						if ( newStateMenus.length ) {
							setMenuId( newStateMenus[ 0 ].id );
						} else {
							setMenuId();
						}
					} }
				/>
			) }
		</>
	);
}
