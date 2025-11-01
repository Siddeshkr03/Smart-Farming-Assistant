import pandas as pd
import requests
from bs4 import BeautifulSoup

# Step 1: URL of Soil Health Card RKVY Dashboard
url = "https://soilhealth.dac.gov.in/RKVYSHC.aspx"  # Main dashboard page

# Step 2: Fetch the page content
response = requests.get(url)
response.raise_for_status()

# Step 3: Parse HTML content
soup = BeautifulSoup(response.text, 'html.parser')

# Step 4: Locate the nutrient data table (usually <table> tag)
tables = soup.find_all("table")

# If no tables found, print message
if not tables:
    print("❌ No tables found on the page. Try visiting the page manually.")
else:
    # Step 5: Convert first table into a pandas DataFrame
    df = pd.read_html(str(tables[0]))[0]

    # Step 6: Clean up the data
    df.columns = df.columns.str.strip()
    df.dropna(how="all", inplace=True)

    # ✅ Step 7: Save data directly into your src/data folder
    output_file = "../src/data/Karnataka_SoilHealthData.xlsx"
    df.to_excel(output_file, index=False)

    print(f"✅ Data extracted and saved successfully as '{output_file}'")
