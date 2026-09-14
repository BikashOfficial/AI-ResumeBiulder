import { createSlice } from "@reduxjs/toolkit";

const initialResumeData = {
  _id: "",
  title: "",
  personal_info: {
    image: "",
    full_name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
    profession: "",
  },
  professional_summary: "",
  experience: [],
  education: [],
  project: [],
  skills: [],
  template: "classic",
  accent_color: "#3B82F6",
  public: false,
};

const resumeSlice = createSlice({
  name: "resume",
  initialState: {
    allResumes: [],
    currentResume: initialResumeData,
    loading: false,
    error: null,
  },
  reducers: {
    setAllResumes: (state, action) => {
      state.allResumes = Array.isArray(action.payload) ? action.payload : [];
    },
    addResume: (state, action) => {
      if (action.payload) {
        state.allResumes.push(action.payload);
      }
    },
    updateResumeInList: (state, action) => {
      const { id, ...updatedFields } = action.payload;
      const index = state.allResumes.findIndex((r) => r._id === id);
      if (index !== -1) {
        state.allResumes[index] = { ...state.allResumes[index], ...updatedFields };
      }
    },
    removeResumeFromList: (state, action) => {
      state.allResumes = state.allResumes.filter((r) => r._id !== action.payload);
    },
    setCurrentResume: (state, action) => {
      state.currentResume = action.payload
        ? { ...initialResumeData, ...action.payload }
        : initialResumeData;
    },
    updateCurrentResume: (state, action) => {
      state.currentResume = { ...state.currentResume, ...action.payload };
    },
    clearCurrentResume: (state) => {
      state.currentResume = initialResumeData;
    },
    setResumeLoading: (state, action) => {
      state.loading = action.payload;
    },
    setResumeError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setAllResumes,
  addResume,
  updateResumeInList,
  removeResumeFromList,
  setCurrentResume,
  updateCurrentResume,
  clearCurrentResume,
  setResumeLoading,
  setResumeError,
} = resumeSlice.actions;

export default resumeSlice.reducer;
