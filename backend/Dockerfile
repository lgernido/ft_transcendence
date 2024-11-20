FROM python:3.12

WORKDIR /code/backend

COPY . /backend/

COPY tools/requirements.txt .

RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

COPY conf/build.sh /build.sh

RUN chmod +x /build.sh

EXPOSE 8000

ENTRYPOINT ["/build.sh", "python", "src/manage.py", "runserver", "0.0.0.0:8000"]
