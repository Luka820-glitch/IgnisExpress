// import React, { useState } from "react";
// import {
//   TextField,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
// } from "@mui/material";
// import { useDispatch } from "react-redux";
// import { updateCourier } from "../../store/slices/courierSlice";
// import type { User } from "../../types";

// interface Props {
//   open: boolean;
//   onClose: () => void;
//   user: User;
// }

// const EditCourierForm: React.FC<Props> = ({ open, onClose, user }) => {
//   const dispatch = useDispatch();
//   const [formData, setFormData] = useState({
//     firstName: user.firstName || "",
//     lastName: user.lastName || "",
//     phoneNumber: user.phoneNumber || "",
//     vehicle: user.vehicle || "",
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const handleSubmit = async () => {
//     dispatch(updateCourier({ id: user.id, courierData: formData }));
//     onClose();
//   };

//   return (
//     <Dialog open={open} onClose={onClose}>
//       <DialogTitle>Edit Your Info</DialogTitle>
//       <DialogContent>
//         <TextField
//           label="First Name"
//           name="firstName"
//           fullWidth
//           value={formData.firstName}
//           onChange={handleChange}
//           sx={{ mb: 2 }}
//         />
//         <TextField
//           label="Last Name"
//           name="lastName"
//           fullWidth
//           value={formData.lastName}
//           onChange={handleChange}
//           sx={{ mb: 2 }}
//         />
//         <TextField
//           label="Phone Number"
//           name="phoneNumber"
//           fullWidth
//           value={formData.phoneNumber}
//           onChange={handleChange}
//           sx={{ mb: 2 }}
//         />
//         <TextField
//           label="Vehicle"
//           name="vehicle"
//           fullWidth
//           value={formData.vehicle}
//           onChange={handleChange}
//           sx={{ mb: 2 }}
//         />
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose}>Cancel</Button>
//         <Button variant="contained" onClick={handleSubmit}>
//           Save
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default EditCourierForm;
