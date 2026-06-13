library(tidyverse)
dodgers <- read_csv("Blog 1 - Ohtani/dodgers2025.csv")
ohtani <- read_csv("Blog 1 - Ohtani/ohtani2025.csv")


ohtani_id <- 660271



dodgers_no_ohtani <- dodgers %>%
  filter(!batter %in% ohtani_id) %>%
  mutate(is_hr = events == "home_run",
         is_bip = description == "hit_into_play")


ohtani <- ohtani %>%
  mutate(is_hr = events == "home_run",
         is_bip = description == "hit_into_play")

#without ohtani
team_summary <- dodgers_no_ohtani %>%
  summarise(
    avg_launch_speed = mean(launch_speed, na.rm = TRUE),
    avg_launch_angle = mean(launch_angle, na.rm = TRUE),
    avg_xwoba = mean(estimated_woba_using_speedangle, na.rm = TRUE),
    babip = mean(babip_value, na.rm = TRUE),
    hr_rate = mean(is_hr, na.rm = TRUE),
    bip_rate = mean(is_bip, na.rm = TRUE)
  ) %>% mutate(player = "Team (no Ohtani)")


ohtani_summary <- ohtani %>%
  summarise(
    avg_launch_speed = mean(launch_speed, na.rm = TRUE),
    avg_launch_angle = mean(launch_angle, na.rm = TRUE),
    avg_xwoba = mean(estimated_woba_using_speedangle, na.rm = TRUE),
    babip = mean(babip_value, na.rm = TRUE),
    hr_rate = mean(is_hr, na.rm = TRUE),
    bip_rate = mean(is_bip, na.rm = TRUE)
  ) %>% mutate(player = "Ohtani")


comparison <- bind_rows(team_summary, ohtani_summary) %>%
  pivot_longer(-player, names_to = "metric", values_to = "value")

ggplot(comparison, aes(x = metric, y = value, fill = player)) +
  geom_col(position = "dodge") +
  labs(
    title = "Shohei Ohtani vs Rest of Dodgers Lineup (2025)",
    x = "",
    y = "Average per Batted Ball or Pitch",
    fill = ""
  ) +
  scale_fill_manual(values = c("Ohtani" = "dodgerblue", "Team (no Ohtani)" = "gray")) +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 30, hjust = 1))
