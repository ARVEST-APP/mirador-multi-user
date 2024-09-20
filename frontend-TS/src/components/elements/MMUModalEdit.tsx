import {
  Button,
  Grid, SelectChangeEvent,
  TextField,
  Tooltip,
} from "@mui/material";
import { ChangeEvent, Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import SaveIcon from "@mui/icons-material/Save";
import { ItemList } from "./ItemList.tsx";
import Selector from "../Selector.tsx";
import { MMUModal } from "./modal.tsx";
import { ModalConfirmDelete } from "../../features/projects/components/ModalConfirmDelete.tsx";
import { ProjectRights } from "../../features/user-group/types/types.ts";
import { ListItem, SelectorItem } from "../types.ts";
import CancelIcon from '@mui/icons-material/Cancel';
interface ModalItemProps<T, G,O> {
  itemOwner: O,
  item: T,
  itemLabel: string,
  updateItem?: (newItem: T) => void,
  deleteItem?: (itemId: number) => void,
  handleDeleteAccessListItem: (itemId: number) => void,
  searchModalEditItem?: (query: string) => Promise<G[]>,
  getOptionLabel?: (option: G, searchInput: string) => string,
  handleSelectorChange: (listItem: ListItem) => (event: SelectChangeEvent) => Promise<void>,
  fetchData: () => Promise<void>,
  listOfItem?: ListItem[],
  setItemToAdd?: Dispatch<SetStateAction<G | null>>,
  handleAddAccessListItem: () => void,
  setSearchInput: Dispatch<SetStateAction<string>>,
  searchInput: string,
  rights: ProjectRights,
  searchBarLabel:string,
  description:string,
  HandleOpenModalEdit:()=>void,
}

export const MMUModalEdit = <O, T extends { id: number }, G>(
  {
    itemLabel,
    setItemToAdd,
    itemOwner,
    item,
    updateItem,
    deleteItem,
    searchModalEditItem,
    getOptionLabel,
    handleSelectorChange,
    fetchData,
    listOfItem,
    handleAddAccessListItem,
    setSearchInput,
    searchInput,
    rights,
    searchBarLabel,
    handleDeleteAccessListItem,
    description,
    HandleOpenModalEdit,
  }: ModalItemProps<T, G, O>) => {
  const [editName, setEditName] = useState(false);
  const [editDescription, setEditDescription] = useState(false);
  const [newItemName, setNewItemName] = useState(itemLabel);
  const [newItemDescription, setNewItemDescription] = useState(description);
  const [openModal, setOpenModal] = useState(false);

  const handleUpdateItemName = useCallback(async () => {
    const itemToUpdate = {...item,
      name:newItemName,
      description:newItemDescription,
    }
    if(updateItem){
      updateItem(itemToUpdate);
    }
    setEditName(false);
    setEditDescription(false)
  }, [item, newItemName, newItemDescription, updateItem, itemOwner, editName, editDescription]);


  const handleEditDescription = useCallback(() => {
    setEditDescription(!editDescription);
  }, [editDescription]);


  const handleChangeName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setNewItemName(e.target.value);
  }, []);

  const handleChangeDescription= useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setNewItemDescription(e.target.value);
  }, []);

  const handleConfirmDeleteItemModal = useCallback(() => {
    setOpenModal(!openModal);
  }, [openModal]);

  useEffect(() => {
    fetchData();
  }, [fetchData, item, itemOwner]);

  const rightsSelectorItems: SelectorItem[] = Object.values(ProjectRights).map((right) => ({
    id: right as unknown as "ADMIN" | "EDITOR" | "READER",
    name: right as unknown as "ADMIN" | "EDITOR" | "READER"
  }));

  const handleGetOtpionLabel = (option : G) =>{
    return getOptionLabel ? getOptionLabel(option, searchInput) : ""
  }
  const handleSearchModalEditItem = (query: string)=>{
    return searchModalEditItem ? searchModalEditItem(query) : [""] as unknown as Promise<string[]>
  }

  const handleSubmit = () => {
    handleUpdateItemName();
    handleEditDescription();
    HandleOpenModalEdit()
  };
  return (
    <Grid container>
      <Grid item container flexDirection="column">
        <Grid
          item
          sx={{ minHeight: '200px' }}
          container
          flexDirection="column"
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid
            item
            sx={{ minHeight: '100px', width: '100%' }}
            container
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <TextField
              type="text"
              label="Name"
              onChange={handleChangeName}
              variant="outlined"
              defaultValue={itemLabel}
              fullWidth
            />
          </Grid>
          <Grid
            item
            sx={{ minHeight: '100px', width: '100%' }}
            container
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <TextField
              type="text"
              label="Description"
              onChange={handleChangeDescription}
              variant="outlined"
              defaultValue={description}
              multiline
              fullWidth
            />
          </Grid>
          <Grid
            item
            sx={{ minHeight: '50px', width: '100%' }}
            container
            justifyContent="flex-end"
            alignItems="center"
          >

          </Grid>
        </Grid>
        {rights !== ProjectRights.READER && listOfItem && setItemToAdd && getOptionLabel !==undefined &&(
          <Grid item>
            <ItemList handleAddAccessListItem={handleAddAccessListItem} setItemToAdd={setItemToAdd} items={listOfItem} handleSearchModalEditItem={handleSearchModalEditItem} removeItem={handleDeleteAccessListItem} searchBarLabel={searchBarLabel} setSearchInput={setSearchInput} handleGetOptionLabel={handleGetOtpionLabel}>
              {(accessListItem) => (
                <Selector
                  selectorItems={rightsSelectorItems}
                  value={accessListItem.rights!}
                  onChange={handleSelectorChange(accessListItem)}
                />
              )}
            </ItemList>
          </Grid>
        )}
        {rights === ProjectRights.ADMIN && (
          <Grid
            item
            container
            justifyContent="space-between"
            alignItems="center"
            flexDirection="row"
          >
            <Grid item>
              <Tooltip title={"Delete item"}>
                <Button
                  color="error"
                  onClick={handleConfirmDeleteItemModal}
                  variant="contained"
                >
                  DELETE
                </Button>
              </Tooltip>
            </Grid>
            <Grid
              item
              container
              justifyContent="flex-end"
              flexDirection="row"
              alignItems="center"
              spacing={2}
              sx={{ width: 'auto' }}
            >
              <Grid item>
                <Button variant="contained" type="button" onClick={HandleOpenModalEdit}>
                  <CancelIcon />
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" type="submit" onClick={handleSubmit}>
                  <SaveIcon />
                  Save
                </Button>
              </Grid>
            </Grid>
            <MMUModal width={400} openModal={openModal} setOpenModal={handleConfirmDeleteItemModal} children={
              <ModalConfirmDelete
                deleteItem={deleteItem}
                itemId={item.id}
                itemName={itemLabel}
              />}/>
          </Grid>

        )}
      </Grid>
    </Grid>
  )
}
