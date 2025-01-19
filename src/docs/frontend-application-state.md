<!-- markdownlint-disable MD007 MD010 MD013 MD024 MD030 MD033 MD041 -->
1.	Data classes
2.	Data properties

### Data classes

Data classes are more concrete values. They'll represent the contents of your data structures.

-   User configuration settings
	-	User preferences
		-	theme
		-	locale
		-	language
		-	font-size
		-	etc
	-	Accessibility settings
-	UI Elements' State
	-	Selected controls
	-	Selected text formatting (Google Docs)
	-	Show/hide state
	-	Any state related to the current visual state of the page
	-	Entered text, etc.
-	Server data
	-	Messages
	-	Posts
	-	Etc., data received from the backend

### Data properties

Data properties are more abstract values to consider when structuring your state.

-	Access level
-	Read/write frequency
-	Size

