import { Autocomplete, Button, Grid, TextField } from "@mui/material";
import { useDebounceCallback } from 'usehooks-ts';
import { Dispatch, SetStateAction, SyntheticEvent, useState } from "react";

interface IUsersSearchBarProps<T>{
  handleAdd?:()=>void
  setSelectedData?:Dispatch<SetStateAction<T | null>>
  setSearchedData?:any
  fetchFunction:(partialString:string)=>Promise<any[]>
  getOptionLabel:(option:any)=>string
  setSearchInput?:(value:string)=>void
  actionButtonLabel?:string
  label:string
}

export const SearchBar = <T,>({label,getOptionLabel,setSearchedData, setSelectedData,fetchFunction,handleAdd,setSearchInput,actionButtonLabel}:IUsersSearchBarProps<T>) => {
  const [suggestions, setSuggestions]=useState<T[]>([]);

  const HandlefetchData = async(partialDataName:string)=>{
    try{
      const data = await fetchFunction(partialDataName);
      console.log('data',data)
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching address data:', error);
    }
  }
  const debouncedFetch = useDebounceCallback(async (value: string) => {
    await HandlefetchData(value)
  }, 500);

  const handleInputChange= async (_event: SyntheticEvent, value: string) => {
    console.log(value)
    if(setSearchInput){
      setSearchInput(value);
    }
    if (value) {
      await debouncedFetch(value);
    }
  }

  const handleChange = (_event: SyntheticEvent, value: T | null) => {
    if(setSelectedData){
      console.log(value)
      setSelectedData(value);
    }else if(setSearchedData){
      setSearchedData(value);
    }
  };
console.log('suggestions',suggestions)
  return(
    <Grid item container flexDirection="column" spacing={1}>
      <Grid item container spacing={2}>
        <Grid item container  spacing={2} direction="row" alignItems="center">
          <Grid item >
            <Autocomplete
              disablePortal
              onInputChange={handleInputChange}
              sx={{width:'250px'}}
              onChange={handleChange}
              id="combo-box-demo"
              options={suggestions}
              clearOnBlur={false}
              renderInput={(params) => <TextField {...params} label={label} />}
              getOptionLabel={getOptionLabel}
            />
          </Grid>
          <Grid item>
            {actionButtonLabel &&(
              <>
                <Button variant="contained" onClick={handleAdd}>{actionButtonLabel}</Button>
              </>
            )
            }
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}
