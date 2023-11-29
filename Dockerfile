#use a very slight version of python
FROM python:3.9-slim

#set working directory
WORKDIR /app

#install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

#copy app code
COPY . .

#expose port and use same command to run in local
EXPOSE 8000
CMD ["gunicorn", "--workers", "2", "--bind", "0.0.0.0:8000", "server:app"]
