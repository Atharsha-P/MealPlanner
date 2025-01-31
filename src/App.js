import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Container, Grid, Card, CardMedia, CardContent, Button, Select, MenuItem, FormControl, InputLabel, TextField, Chip, Box } from "@mui/material";
import axios from "axios";

const API_URL = "http://localhost:5000/recipes";
const API_PLANNED_MEAL = "http://localhost:5000/plannedMeal";

const App = () => {
  const [recipes, setRecipes] = useState([]);
  const [mealType, setMealType] = useState("");
  const [dietary, setDietary] = useState([]);
  const [ingredient, setIngredient] = useState("");
  const [ingredientList, setIngredientList] = useState([]);

  // Fetch recipes whenever filters change
  useEffect(() => {
    fetchRecipes();
  }, [mealType, dietary, ingredientList, ingredient]); // Include ingredient as dependency

  const fetchRecipes = async () => {
    try {
      const response = await axios.get(API_URL, {
        params: {
          mealType,
          dietary: dietary.join(","),
          ingredient: ingredientList.join(","),
          recipeName: ingredient, // Add the recipe name filter here
        },
      });
      setRecipes(response.data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const handleAddToPlannedMeal = async (recipe) => {
    try {
      await axios.post(API_PLANNED_MEAL, recipe);
    } catch (error) {
      console.error("Error adding to planned meal:", error);
    }
  };

  const handleAddIngredient = () => {
    if (ingredient && !ingredientList.includes(ingredient)) {
      setIngredientList([...ingredientList, ingredient]);
      setIngredient(""); // Reset input field after adding
    }
  };

  const handleRemoveIngredient = (ingredientToRemove) => {
    setIngredientList(ingredientList.filter(ing => ing !== ingredientToRemove));
  };

  const handleDietaryChange = (event) => {
    const { value } = event.target;
    setDietary(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <Router>
      <div>
        <AppBar position="static" sx={{ background: "linear-gradient(45deg,rgb(255, 196, 0),rgba(255, 130, 34, 0.95))" }}>
          <Toolbar>
            <Typography variant="h4" sx={{ flexGrow: 1, color: "white", textAlign: "center", fontWeight: "bold" }}>
              FeastBliss
            </Typography>
            <Button component={Link} to="/planned-meal" sx={{ color: "white" }}>
              Planned Meal
            </Button>
          </Toolbar>
        </AppBar>

        {/* Filters */}
        <Container sx={{ marginTop: 3 }}>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Meal Type</InputLabel>
                <Select
                  value={mealType}
                  label="Meal Type"
                  onChange={(e) => setMealType(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Breakfast">Breakfast</MenuItem>
                  <MenuItem value="Lunch">Lunch</MenuItem>
                  <MenuItem value="Dinner">Dinner</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Dietary</InputLabel>
                <Select
                  multiple
                  value={dietary}
                  onChange={handleDietaryChange}
                  renderValue={(selected) => selected.join(", ")}
                >
                  <MenuItem value="Vegetarian">Vegetarian</MenuItem>
                  <MenuItem value="Vegan">Vegan</MenuItem>
                  <MenuItem value="Gluten-Free">Gluten-Free</MenuItem>
                  <MenuItem value="Keto">Keto</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Search by Ingredient/Dish"
                value={ingredient}
                onChange={(e) => setIngredient(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddIngredient();
                  }
                }}
              />
              <Button variant="contained" sx={{ marginTop: 1 }} onClick={handleAddIngredient}>
                Add Ingredient
              </Button>
              <Box sx={{ marginTop: 1 }}>
                {ingredientList.map((ingredientItem) => (
                  <Chip
                    key={ingredientItem}
                    label={ingredientItem}
                    onDelete={() => handleRemoveIngredient(ingredientItem)}
                    sx={{ marginRight: 1, marginBottom: 1 }}
                  />
                ))}
              </Box>
            </Grid>

          </Grid>
        </Container>

        {/* Recipe Cards */}
        <Container sx={{ marginTop: 4, background: "linear-gradient(45deg, #ff9800, #ff5722)", minHeight: "100vh" }}>
          <Grid container spacing={3}>
            {recipes.map((recipe) => (
              <Grid item key={recipe._id} xs={12} sm={4}>
                <Card sx={{ boxShadow: 3, transition: "all 0.3s ease", "&:hover": { background: "linear-gradient(45deg, #ff9800, #ff5722)", transform: "scale(1.05)" } }}>
                  <CardMedia component="img" height="200" image={recipe.image} alt={recipe.title} />
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">{recipe.title}</Typography>
                    <Button fullWidth variant="contained" onClick={() => window.open(recipe.recipeLink, "_blank")}>
                      View Recipe
                    </Button>
                    <Button fullWidth variant="contained" sx={{ marginTop: 1 }} onClick={() => handleAddToPlannedMeal(recipe)}>
                      Add to Planned Meal
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Routes for planned meal */}
        <Routes>
          <Route path="/planned-meal" element={<PlannedMeal />} />
        </Routes>
      </div>
    </Router>
  );
};

const PlannedMeal = () => {
  const [plannedMeals, setPlannedMeals] = useState([]);

  useEffect(() => {
    fetchPlannedMeals();
  }, []);

  const fetchPlannedMeals = async () => {
    try {
      const response = await axios.get(API_PLANNED_MEAL);
      setPlannedMeals(response.data);
    } catch (error) {
      console.error("Error fetching planned meals:", error);
    }
  };

  const handleRemoveFromPlannedMeal = async (id) => {
    try {
      await axios.delete(`${API_PLANNED_MEAL}/${id}`);
      setPlannedMeals(plannedMeals.filter(meal => meal._id !== id));
    } catch (error) {
      console.error("Error removing from planned meals:", error);
    }
  };

  return (
    <Container sx={{ marginTop: 4 }}>
      <Grid container spacing={3}>
        {plannedMeals.map((meal) => (
          <Grid item key={meal._id} xs={12} sm={4}>
            <Card sx={{ boxShadow: 3 }}>
              <CardMedia component="img" height="200" image={meal.image} alt={meal.title} />
              <CardContent>
                <Typography variant="h6" fontWeight="bold">{meal.title}</Typography>
                <Button fullWidth variant="contained"
                 onClick={() => window.open(meal.recipeLink, "_blank")}>
                  View Recipe
                </Button>
                <Button fullWidth variant="contained" color="error" sx={{ marginTop: 1 }} onClick={() => handleRemoveFromPlannedMeal(meal._id)}>
                  Remove
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default App;
