FROM python:3.12

WORKDIR /code/backend

COPY . /backend/

COPY tools/requirements.txt .

RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

COPY conf/wait-for-it.sh /wait-for-it.sh

RUN chmod +x /wait-for-it.sh

EXPOSE 8000

ENTRYPOINT ["/wait-for-it.sh", "db:5432", "--timeout=15", "--", "python", "src/manage.py", "runserver", "0.0.0.0:8000"]