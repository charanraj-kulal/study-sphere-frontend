import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  TextField,
  Button,
} from "@mui/material";
import { styled } from "@mui/system";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import COntactUsImage from "../../assets/images/landingpage_illustrations/contact-us.gif";

gsap.registerPlugin(ScrollTrigger);

const StyledContactSection = styled("section")(({ theme }) => ({
  background: "#fff",
  paddingTop: "120px", // Increased top padding
  paddingBottom: "50px",
  minHeight: "100vh",
  position: "relative",
}));
const SectionTitle = styled(Typography)(({ theme }) => ({
  fontFamily: "Pacifico, cursive",
  color: "#0033a0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 30px auto",
  padding: "20px 0",
  width: "50%",
  "&::before, &::after": {
    content: '""',
    flex: 1,
    height: 2,
    borderBottom: "2px solid #0033a0",
    margin: "0px 15px",
  },
}));

const ContactUsImageStyled = styled(Box)(({ theme }) => ({
  width: "80%",
  height: "auto",
  overflow: "hidden",
  "& img": {
    width: "100%",
    height: "auto",
    transformOrigin: "center center",
  },
}));

const FormContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#0033a0",
    },
    "&:hover fieldset": {
      borderColor: "#0033a0",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#0033a0",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#0033a0",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#0033a0",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#002277",
  },
}));

const ContactUs = () => {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current.querySelector("img");
    const formElements = formRef.current.querySelectorAll("form > *");

    gsap.set(image, { scale: 0.8, opacity: 0, rotation: -5 });
    gsap.set(formElements, { y: 30, opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top center",
        end: "center center",
        scrub: 1,
      },
    });

    tl.to(image, {
      scale: 1,
      opacity: 1,
      rotation: 0,
      duration: 1,
      ease: "power2.out",
    }).to(
      formElements,
      {
        y: 0,
        opacity: 1,
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out",
      },
      "-=0.5"
    );

    return () => {
      tl.kill();
    };
  }, []);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await fetch(
          import.meta.env.VITE_SERVER_URL + "/api/send-contact-email",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: formData.name,
              email: formData.email,
              subject: formData.subject,
              message: formData.message,
            }),
          }
        );

        if (response.ok) {
          alert("Message sent successfully!");
          // Clear the form
          setFormData({
            name: "",
            email: "",
            subject: "",
            message: "",
          });
        } else {
          throw new Error("Failed to send message");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to send message. Please try again.");
      }
    }
  };

  return (
    <StyledContactSection id="contact" ref={sectionRef}>
      <SectionTitle variant="h4">Contact Us</SectionTitle>
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <ContactUsImageStyled ref={imageRef}>
              <img src={COntactUsImage} alt="Students" />
            </ContactUsImageStyled>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormContainer ref={formRef}>
              <form onSubmit={handleSubmit}>
                <StyledTextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={!!errors.name}
                  helperText={errors.name}
                />
                <StyledTextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={!!errors.email}
                  helperText={errors.email}
                />
                <StyledTextField
                  fullWidth
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  error={!!errors.subject}
                  helperText={errors.subject}
                />
                <StyledTextField
                  fullWidth
                  label="Message"
                  name="message"
                  multiline
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  error={!!errors.message}
                  helperText={errors.message}
                />
                <StyledButton type="submit" variant="contained" fullWidth>
                  Send
                </StyledButton>
              </form>
            </FormContainer>
          </Grid>
        </Grid>
      </Container>
    </StyledContactSection>
  );
};

export default ContactUs;
